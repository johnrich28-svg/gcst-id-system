import React, { createContext, useState, useContext } from 'react';

const RequestContext = createContext();

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [currentRequest, setCurrentRequest] = useState(null);

  const addRequest = (request) => {
    setRequests([...requests, { ...request, id: Date.now().toString() }]);
  };

  const getRequestByRef = (refNo) => {
    return requests.find(r => r.refNo === refNo);
  };

  return (
    <RequestContext.Provider value={{ requests, currentRequest, addRequest, getRequestByRef, setCurrentRequest }}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequest = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequest must be used within a RequestProvider');
  }
  return context;
};
