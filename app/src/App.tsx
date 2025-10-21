import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Toaster } from 'react-hot-toast';
import { Routes, Route } from 'react-router';
import { useEffect } from 'react';
import AnchorInteractor from './components/AnchorInteractor';


const App = () => {

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', true);
  }, []);
  
  return (
    <div className="bg-[url('/background.jpg')] bg-cover h-screen flex flex-col overflow-y-scroll">
      <div><Toaster/></div>
      <div className='relative p-1 px-4 flex justify-between items-center bg-background/40 border-b w-full'>
        <div><WalletMultiButton/></div>
      </div>
      <Routes>
        <Route path='/' element={<AnchorInteractor />} />
      </Routes>
    </div>
  );
};

export default App;