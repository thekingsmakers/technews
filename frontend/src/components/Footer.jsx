import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">&copy; 2024 KingsNews. All rights reserved.</p>
          <div className="flex space-x-4">
            {/* Add your social media links here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
