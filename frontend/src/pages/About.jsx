import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const About = () => {
  const [showButton, setShowButton] = useState(true); // Initially show button
  const navigate = useNavigate();

  // Track scroll position to toggle button visibility
  const handleScroll = () => {
    if (window.scrollY > 0) {
      setShowButton(false); // Hide button when scrolling down
    } else {
      setShowButton(true); // Show button when at the top
    }
  };

  // Add and remove scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img className="w-full md:max-w-[450px]" src={assets.about_img} alt="" />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p></p>
          <p></p>
          <b className="text-gray-800">Our Mission</b>
          <p></p>
        </div>
      </div>

      <div className="text-xl py-4">
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Quality Assurance:</b>
          <p className="text-gray-600">We meticulously select and vet each product to ensure it meets our stringent quality standards.</p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Convenience:</b>
          <p className="text-gray-600">With our user-friendly interface and hassle-free ordering process, shopping has been easier.</p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Exceptional Customer Service:</b>
          <p className="text-gray-600">Our team of dedicated professionals is here to assist you the way, ensuring your satisfaction is our top priority.</p>
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

export default About;
