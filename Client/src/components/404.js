import React from 'react'
import {useNavigate} from "react-router-dom";

export const CMP404 = () => {
  const navigate = useNavigate();
  // Navigate to home page after few seconds
  setTimeout(() => {
    navigate("/");
  }, 1400);
  
  return (
    <main>
      <h1>404 Error / Page not found 😕</h1>    
    </main>
  )
}
