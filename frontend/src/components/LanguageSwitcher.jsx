import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select 
      value={i18n.language} 
      onChange={changeLanguage} 
      className="form-select" 
      style={{ padding: '4px 28px 4px 8px', fontSize: '0.85rem', height: '30px', minHeight: '30px', marginRight: '10px' }}
    >
      <option value="ru">RU</option>
      <option value="kk">KK</option>
      <option value="en">EN</option>
    </select>
  );
}
