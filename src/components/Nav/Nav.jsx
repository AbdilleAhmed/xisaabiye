import { NavLink, useNavigate } from 'react-router-dom';
import useStore from '../../zustand/store';
import useLanguageStore from '../../zustand/slices/language.slice';

function Nav() {
  const user = useStore((store) => store.user);
  const logOut = useStore((store) => store.logOut);
  const navigate = useNavigate();

  const { language, translations } = useLanguageStore();
  const tAbout = translations[language].about;

  const handleLogout = () => {
    logOut();
    navigate('/login');
  };

  return (
    <nav style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
      <ul style={{ listStyle: 'none', display: 'flex', gap: '10px', padding: 0, margin: 0 }}>
        {!user?.id && (
          <li>
            <NavLink to="/login" style={{ textDecoration: 'none', color: 'black' }}>
              {language === 'so' ? 'Gal' : 'Login'}
            </NavLink>
          </li>
        )}

        {user?.id && (
          <>
            <li>
              <NavLink to="/dashboard" style={{ textDecoration: 'none', color: 'black' }}>
                {language === 'so' ? 'Dashboard' : 'Dashboard'}
              </NavLink>
            </li>
            {(user.role === 'admin' || user.role === 'owner') && (
              <li>
                <NavLink to="/registration" style={{ textDecoration: 'none', color: 'black' }}>
                  {language === 'so' ? 'Diiwaangeli' : 'Register'}
                </NavLink>
              </li>
            )}
            <li>
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'black' }}
              >
                {language === 'so' ? 'Ka bax' : 'Logout'}
              </button>
            </li>
          </>
        )}

        <li>
          <NavLink to="/about" style={{ textDecoration: 'none', color: 'black' }}>
            {tAbout.title}
          </NavLink>
        </li>
        {/* <NavLink to="/addtransaction">Add Transaction</NavLink> */}


    
       
     

      </ul>
    </nav>
  );
}

export default Nav;




