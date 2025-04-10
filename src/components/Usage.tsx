import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';

interface MedicationUsage {
  id: string;
  patient_id: string;
  medication_id: string;
  hospital_id: string;
  quantity: number;
  unit_cost_at_time: number;
  administered_at: string;
  created_at: string;
  patients: {
    name: string;
    medical_record_number: string;
  };
  medications: {
    name: string;
    current_stock: number;
  };
  hospitals: {
    name: string;
  };
}

interface Patient {
  id: string;
  name: string;
  medical_record_number: string;
}

interface Medication {
  id: string;
  name: string;
  unit_cost: number;
  current_stock: number;
}

interface Hospital {
  id: string;
  name: string;
}

function Usage() {
  const [usageRecords, setUsageRecords] = useState<MedicationUsage[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicationUsage | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    medication_id: '',
    hospital_id: '',
    quantity: '1',
    administered_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [usageResponse, patientsResponse, medicationsResponse, hospitalsResponse] = await Promise.all([
        supabase
          .from('medication_usage')
          .select(`
            *,
            patients (name, medical_record_number),
            medications (name, current_stock),
            hospitals (name)
          `)
          .order('administered_at', { ascending: false }),
        supabase
          .from('patients')
          .select('id, name, medical_record_number')
          .order('name'),
        supabase
          .from('medications')
          .select('id, name, unit_cost, current_stock')
          .order('name'),
        supabase
          .from('hospitals')
          .select('id, name')
          .order('name')
      ]);

      if (usageResponse.error) throw usageResponse.error;
      if (patientsResponse.error) throw patientsResponse.error;
      if (medicationsResponse.error) throw medicationsResponse.error;
      if (hospitalsResponse.error) throw hospitalsResponse.error;

      setUsageRecords(usageResponse.data || []);
      setPatients(patientsResponse.data || []);
      setMedications(medicationsResponse.data || []);
      setHospitals(hospitalsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const medication = medications.find(m => m.id === formData.medication_id);
      if (!medication) throw new Error('Medication not found');

      if (editingRecord) {
        // Handle edit
        const oldQuantity = editingRecord.quantity;
        const newQuantity = parseInt(formData.quantity);
        const quantityDiff = newQuantity - oldQuantity;
        
        const { error } = await supabase
          .from('medication_usage')
          .update({
            quantity: newQuantity,
            administered_at: formData.administered_at,
          })
          .eq('id', editingRecord.id);

        if (error) throw error;

        // Update medication stock
        const { error: stockError } = await supabase
          .from('medications')
          .update({ current_stock: medication.current_stock - quantityDiff })
          .eq('id', medication.id);

        if (stockError) throw stockError;
      } else {
        // Handle new record
        const { error } = await supabase
          .from('medication_usage')
          .insert([{
            patient_id: formData.patient_id,
            medication_id: formData.medication_id,
            hospital_id: formData.hospital_id,
            quantity: parseInt(formData.quantity),
            unit_cost_at_time: medication.unit_cost,
            administered_at: formData.administered_at,
          }]);

        if (error) throw error;

        // Update medication stock
        const { error: stockError } = await supabase
          .from('medications')
          .update({ current_stock: medication.current_stock - parseInt(formData.quantity) })
          .eq('id', medication.id);

        if (stockError) throw stockError;
      }
      
      setFormData({
        patient_id: '',
        medication_id: '',
        hospital_id: '',
        quantity: '1',
        administered_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
      setShowForm(false);
      setEditingRecord(null);
      fetchData();
    } catch (error) {
      console.error('Error managing usage record:', error);
    }
  }

  async function handleDelete(record: MedicationUsage) {
    try {
      const { error } = await supabase
        .from('medication_usage')
        .delete()
        .eq('id', record.id);

      if (error) throw error;

      // Restore medication stock
      const { error: stockError } = await supabase
        .from('medications')
        .update({ 
          current_stock: record.medications.current_stock + record.quantity 
        })
        .eq('id', record.medication_id);

      if (stockError) throw stockError;

      setShowDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  }

  function handleEdit(record: MedicationUsage) {
    setEditingRecord(record);
    setFormData({
      patient_id: record.patient_id,
      medication_id: record.medication_id,
      hospital_id: record.hospital_id,
      quantity: record.quantity.toString(),
      administered_at: format(new Date(record.administered_at), "yyyy-MM-dd'T'HH:mm"),
    });
    setShowForm(true);
  }

  function calculatePatientTotal(patientId: string): number {
    return usageRecords
      .filter(record => record.patient_id === patientId)
      .reduce((total, record) => total + (record.quantity * record.unit_cost_at_time), 0);
  }

  const groupedByPatient = usageRecords.reduce((acc, record) => {
    const patientId = record.patient_id;
    if (!acc[patientId]) {
      acc[patientId] = [];
    }
    acc[patientId].push(record);
    return acc;
  }, {} as Record<string, MedicationUsage[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Medication Usage</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingRecord(null);
            setFormData({
              patient_id: '',
              medication_id: '',
              hospital_id: '',
              quantity: '1',
              administered_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Record Usage'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingRecord ? 'Edit Medication Usage' : 'Record Medication Usage'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient</label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!!editingRecord}
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.medical_record_number})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Medication</label>
              <select
                required
                value={formData.medication_id}
                onChange={(e) => setFormData({ ...formData, medication_id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!!editingRecord}
              >
                <option value="">Select Medication</option>
                {medications.map(medication => (
                  <option key={medication.id} value={medication.id}>
                    {medication.name} (Stock: {medication.current_stock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hospital</label>
              <select
                required
                value={formData.hospital_id}
                onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!!editingRecord}
              >
                <option value="">Select Hospital</option>
                {hospitals.map(hospital => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Administered At</label>
              <input
                type="datetime-local"
                required
                value={formData.administered_at}
                onChange={(e) => setFormData({ ...formData, administered_at: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingRecord ? 'Update Record' : 'Save Record'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedByPatient).map(([patientId, records]) => {
          const patient = records[0]?.patients;
          if (!patient) return null;

          return (
            <div key={patientId} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {patient.name} ({patient.medical_record_number})
                  </h3>
                  <span className="text-lg font-bold text-blue-600">
                    Total Cost: ${calculatePatientTotal(patientId).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administered At</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.medications.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.hospitals.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.unit_cost_at_time.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(record.quantity * record.unit_cost_at_time).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(record.administered_at), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(record.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                          
                          {showDeleteConfirm === record.id && (
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                                <div className="flex items-center mb-4">
                                  <AlertCircle className="text-red-600 w-6 h-6 mr-2" />
                                  <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                                </div>
                                <p className="mb-4 text-sm text-gray-500">
                                  Are you sure you want to delete this medication usage record? This action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-3">
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleDelete(record)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {!loading && usageRecords.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No medication usage records found. Add your first record!
          </div>
        )}
      </div>
    </div>
  );
}

export default Usage;