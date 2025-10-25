import { NavLink } from 'react-router-dom';

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

const Nav = () => (
  <nav className="flex gap-2">
    <NavLink to="/" className={linkClasses} end>
      Dashboard
    </NavLink>
    <NavLink to="/items" className={linkClasses}>
      Items
    </NavLink>
    <NavLink to="/about" className={linkClasses}>
      About
    </NavLink>
  </nav>
);

export default Nav;
