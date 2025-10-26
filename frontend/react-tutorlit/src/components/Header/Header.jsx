import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        {/* Заглушка CP - ничего не делает */}
        <button className="header-btn header-btn-disabled">CP</button>
        
        {/* Активная кнопка создания курса */}
        <a href="/create-course" className="header-link">
          <button className="header-btn">Курсы</button>
        </a>
      </div>
      
      <div className="header-right">
        <button className="header-btn">Вход</button>
        <button className="header-btn">Регистрация</button>
      </div>
    </header>
  );
}

export default Header;