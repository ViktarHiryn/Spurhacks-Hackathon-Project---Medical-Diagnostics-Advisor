import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Pill,
  CheckCircle,
  X,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import apiClient from "../api/client";

const MedicationTracker = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { medications, addMedication, updateMedication, removeMedication } =
    useUser();

  // Sample medication data for demo
  useEffect(() => {
    if (medications.length === 0) {
      // Add some sample medications for demo
      const sampleMeds = [];

      sampleMeds.forEach((med) => addMedication(med));
    }
  }, [medications.length, addMedication]);

  const searchPharmacy = async (medicationName) => {
    if (!medicationName.trim()) return;

    setSearchLoading(true);
    try {
      const response = await apiClient.medications.searchPharmacy(
        medicationName
      );
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error("Pharmacy search error:", error);
      // Mock data for demo
      setSearchResults([
        {
          pharmacy: "CVS Pharmacy - Main St",
          address: "123 Main St, City, State",
          distance: "0.5 miles",
          price: "$12.99",
          inStock: true,
          phone: "(555) 123-4567",
        },
        {
          pharmacy: "Walgreens - Oak Ave",
          address: "456 Oak Ave, City, State",
          distance: "1.2 miles",
          price: "$15.49",
          inStock: true,
          phone: "(555) 234-5678",
        },
        {
          pharmacy: "Rite Aid - Elm St",
          address: "789 Elm St, City, State",
          distance: "2.1 miles",
          price: "$11.79",
          inStock: false,
          phone: "(555) 345-6789",
        },
      ]);
    } finally {
      setSearchLoading(false);
    }
  };

  const getMedicationStatus = (medication) => {
    const today = new Date();
    const expiryDate = new Date(medication.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiryDate - today) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0)
      return { status: "expired", color: "red", text: "Expired" };
    if (daysUntilExpiry <= 30)
      return {
        status: "expiring",
        color: "amber",
        text: `Expires in ${daysUntilExpiry} days`,
      };
    if (medication.stock <= 10)
      return {
        status: "low-stock",
        color: "orange",
        text: `Low stock (${medication.stock} left)`,
      };
    return { status: "active", color: "green", text: "Active" };
  };

  const getStatusBadge = (status) => {
    const colors = {
      expired: "bg-red-100 text-red-800 border-red-200",
      expiring: "bg-amber-100 text-amber-800 border-amber-200",
      "low-stock": "bg-orange-100 text-orange-800 border-orange-200",
      active: "bg-green-100 text-green-800 border-green-200",
    };

    return colors[status.status] || colors.active;
  };

  const expiredMeds = medications.filter(
    (med) => getMedicationStatus(med).status === "expired"
  );
  const expiringMeds = medications.filter(
    (med) => getMedicationStatus(med).status === "expiring"
  );
  const lowStockMeds = medications.filter(
    (med) => getMedicationStatus(med).status === "low-stock"
  );

  return (
    <div className="flex-1 bg-neutral-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Medication Tracker
              </h1>
              <p className="text-neutral-600 mt-2">
                Manage your medications and track expiry dates
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Medication</span>
            </button>
          </div>

          {/* Alerts */}
          {(expiredMeds.length > 0 ||
            expiringMeds.length > 0 ||
            lowStockMeds.length > 0) && (
            <div className="mt-6 space-y-3">
              {expiredMeds.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-medium text-red-900">
                      {expiredMeds.length} medication
                      {expiredMeds.length > 1 ? "s" : ""} expired
                    </span>
                  </div>
                </div>
              )}

              {expiringMeds.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="font-medium text-amber-900">
                      {expiringMeds.length} medication
                      {expiringMeds.length > 1 ? "s" : ""} expiring soon
                    </span>
                  </div>
                </div>
              )}

              {lowStockMeds.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Pill className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="font-medium text-orange-900">
                      {lowStockMeds.length} medication
                      {lowStockMeds.length > 1 ? "s" : ""} running low
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Medications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {medications.map((medication) => {
              const status = getMedicationStatus(medication);
              return (
                <motion.div
                  key={medication.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <Pill className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          {medication.name}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {medication.dosage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingMed(medication)}
                        className="p-1 hover:bg-neutral-100 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4 text-neutral-500" />
                      </button>
                      <button
                        onClick={() => removeMedication(medication.id)}
                        className="p-1 hover:bg-neutral-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Status</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(
                          status
                        )}`}
                      >
                        {status.text}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">
                        Frequency
                      </span>
                      <span className="text-sm font-medium text-neutral-900">
                        {medication.frequency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Stock</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {medication.stock} pills
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Expires</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {new Date(medication.expiryDate).toLocaleDateString()}
                      </span>
                    </div>

                    {medication.prescribedBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">
                          Prescribed by
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {medication.prescribedBy}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <button
                      onClick={() => {
                        setSearchQuery(medication.name);
                        searchPharmacy(medication.name);
                      }}
                      className="w-full btn-secondary text-sm flex items-center justify-center space-x-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Find in Pharmacies</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {medications.length === 0 && (
          <div className="text-center py-12">
            <Pill className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-neutral-900 mb-2">
              No medications added yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Start by adding your first medication to track
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First Medication
            </button>
          </div>
        )}

        {/* Pharmacy Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Pharmacy Results for "{searchQuery}"
            </h2>
            <div className="grid gap-4">
              {searchResults.map((result, index) => (
                <div key={index} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900">
                        {result.pharmacy}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {result.distance}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {result.price}
                        </div>
                        <div
                          className={`flex items-center ${
                            result.inStock ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {result.inStock ? "In Stock" : "Out of Stock"}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        {result.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <button className="btn-primary text-sm">
                        Call {result.phone}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Medication Modal */}
      {(showAddModal || editingMed) && (
        <MedicationModal
          medication={editingMed}
          onSave={(medData) => {
            if (editingMed) {
              updateMedication({ ...editingMed, ...medData });
              setEditingMed(null);
            } else {
              addMedication({ ...medData, id: Date.now() });
              setShowAddModal(false);
            }
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingMed(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Component for Adding/Editing Medications
const MedicationModal = ({ medication = null, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "Daily",
    prescribedBy: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    expiryDate: "",
    stock: "",
    notes: "",
    isActive: true,
    ...medication,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              {medication ? "Edit Medication" : "Add New Medication"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 10mg, 1 tablet"
                  className="input-field"
                  value={formData.dosage}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Frequency
                </label>
                <select
                  className="input-field"
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                >
                  <option value="As needed">As needed</option>
                  <option value="Daily">Daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Current Stock
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Prescribed By
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.prescribedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, prescribedBy: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Notes
              </label>
              <textarea
                rows="3"
                className="input-field"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Special instructions, side effects, etc."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {medication ? "Update Medication" : "Add Medication"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default MedicationTracker;
