import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('th'); // Default to Thai

  useEffect(() => {
    // Set initial language based on detected language or default to Thai
    const language = i18n.language || 'th';
    setCurrentLanguage(language);
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="btn-language-toggle"
    >
      {currentLanguage === 'en' ? 'ไทย' : 'English'}
    </button>
  );
};

export default LanguageToggle;