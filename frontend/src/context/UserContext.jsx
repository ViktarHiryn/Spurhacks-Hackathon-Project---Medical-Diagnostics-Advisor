import React, { createContext, useContext, useReducer, useEffect } from "react";

const UserContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  medicalHistory: [],
  currentSession: null,
  medications: [],
  tasks: [],
};

function userReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case "LOGOUT":
      return {
        ...initialState,
      };
    case "ADD_MEDICAL_RECORD":
      return {
        ...state,
        medicalHistory: [...state.medicalHistory, action.payload],
      };
    case "SET_CURRENT_SESSION":
      return {
        ...state,
        currentSession: action.payload,
      };
    case "ADD_MEDICATION":
      return {
        ...state,
        medications: [...state.medications, action.payload],
      };
    case "UPDATE_MEDICATION":
      return {
        ...state,
        medications: state.medications.map((med) =>
          med.id === action.payload.id ? action.payload : med
        ),
      };
    case "REMOVE_MEDICATION":
      return {
        ...state,
        medications: state.medications.filter(
          (med) => med.id !== action.payload
        ),
      };
    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    default:
      return state;
  }
}

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load user data from localStorage on init
  useEffect(() => {
    const savedUser = localStorage.getItem("aiDoctorUser");
    if (savedUser) {
      dispatch({ type: "SET_USER", payload: JSON.parse(savedUser) });
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("aiDoctorUser", JSON.stringify(state.user));
    }
  }, [state.user]);

  const contextValue = {
    ...state,
    dispatch,
    setUser: (user) => dispatch({ type: "SET_USER", payload: user }),
    logout: () => dispatch({ type: "LOGOUT" }),
    addMedicalRecord: (record) =>
      dispatch({ type: "ADD_MEDICAL_RECORD", payload: record }),
    setCurrentSession: (session) =>
      dispatch({ type: "SET_CURRENT_SESSION", payload: session }),
    addMedication: (medication) =>
      dispatch({ type: "ADD_MEDICATION", payload: medication }),
    updateMedication: (medication) =>
      dispatch({ type: "UPDATE_MEDICATION", payload: medication }),
    removeMedication: (id) =>
      dispatch({ type: "REMOVE_MEDICATION", payload: id }),
    addTask: (task) => dispatch({ type: "ADD_TASK", payload: task }),
    updateTask: (task) => dispatch({ type: "UPDATE_TASK", payload: task }),
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
