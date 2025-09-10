import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="btn-language-toggle"
    >
      {i18n.language === 'en' ? 'ไทย' : 'English'}
    </button>
  );
};

export default LanguageToggle;