import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const Contact = () => {
  const [showButton, setShowButton] = useState(true); 
  const navigate = useNavigate();

  const handleScroll = () => {
    if (window.scrollY > 0) {
      setShowButton(false); 
    } else {
      setShowButton(true); 
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div>
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        <img className="w-full md:max-w-[480px]" src={assets.contact_img} alt="" />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-bold text-xl text-gray-800">Our Office</p>
          <p className="text-gray-900">123<br /> 123</p>
          <p className="text-gray-900">Tel: <br /> Email: <span className='text-normal text-gray-500'></span></p>
        </div>
      </div>

      <NewsletterBox />

      {/* Back to Collection Button */}
      <button
        onClick={() => navigate('/collection')}
        className={`${
          showButton ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-500 ease-in-out fixed top-40 left-0 ml-[-5px] bg-black text-white px-3 py-2 rounded-md text-xs sm:text-xs sm:hidden`}
      >
        Back to Collection
      </button>
    </div>
  );
};

export default Contact;
