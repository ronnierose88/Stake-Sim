import { Link } from 'react-router-dom';
import stakeLogo from '@/assets/stake-logo.png';

const Navbar = () => {
  return (
    <nav className="bg-background shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={stakeLogo}
            alt="Stake Logo"
            className="h-10 w-auto"
            style={{ objectFit: 'contain' }}
          />
        </Link>
        {/* Add your navigation links here */}
      </div>
    </nav>
  );
};

export default Navbar;