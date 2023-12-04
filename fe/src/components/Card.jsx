import React from 'react';
import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';
import {
    FaBath,
    FaBed,
  } from 'react-icons/fa';

export default function Card({ listing }) {
  return (
    <div className='bg-slate-100 shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[270px]'>
        <Link to={`/listing/${listing._id}`}>
            <img src={listing.imageUrls[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'} alt="image" className='h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300'/>
            <div className='p-3 flex flex-col gap-2 w-full'>
                <p className='truncate text-lg font-semibold text-slate-700'>{listing.name}</p>
                <div className='flex items-center gap-1'>
                    <MdLocationOn className='h-4 w-4 text-green-700' />
                    <p className='text-sm text-gray-600 truncate w-full'>
                        {listing.address}
                    </p>
                </div>
                <p className='text-sm text-gray-600 line-clamp-2'>
                    {listing.description}
                </p>
                <p className='text-slate-500 mt-2 font-semibold '>
                    $
                    {listing.offer
                    ? listing.discountPrice.toLocaleString('en-US')
                    : listing.regularPrice.toLocaleString('en-US')}
                    {listing.type === 'rent' && ' / month'}
                </p>
                <div className='text-slate-700 flex gap-4'>
                    <div className='flex items-center gap-1 font-bold text-xs'>
                        <FaBed className='text-lg' />
                        {listing.bedrooms > 1
                            ? `${listing.bedrooms} beds `
                            : `${listing.bedrooms} bed `}
                    </div>
                    <div className='flex items-center gap-1 font-bold text-xs'>
                        <FaBath className='text-lg' />
                        {listing.bathrooms > 1
                            ? `${listing.bathrooms} baths `
                            : `${listing.bathrooms} bath `}
                    </div>
                </div>
            </div>
        </Link>
    </div>
  )
}
