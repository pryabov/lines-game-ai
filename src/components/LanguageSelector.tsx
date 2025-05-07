import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Language, languageNames, languageCountryCodes } from '../translations';
import 'flag-icon-css/css/flag-icons.min.css';
import '../styles/LanguageSelector.scss';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Determine if current language is CJK (Chinese, Japanese, Korean)
  const isAsianScript = language === 'zh' || language === 'ja';

  // Sort languages alphabetically by their display names
  const sortedLanguages = Object.entries(languageNames)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([code]) => code as Language);

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button 
        className={`language-button ${isAsianScript ? 'asian-script' : ''}`}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`flag-icon flag-icon-${languageCountryCodes[language]}`}></span>
        <span className="language-name">{languageNames[language]}</span>
      </button>
      {isOpen && (
        <div className="language-dropdown">
          {sortedLanguages.map((langCode) => (
            <button
              key={langCode}
              className={`language-option ${langCode === language ? 'active' : ''} ${
                langCode === 'zh' || langCode === 'ja' ? 'asian-script' : ''
              }`}
              onClick={() => handleLanguageSelect(langCode)}
              aria-selected={langCode === language}
            >
              <span className={`flag-icon flag-icon-${languageCountryCodes[langCode]}`}></span>
              <span className="language-name">{languageNames[langCode]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 