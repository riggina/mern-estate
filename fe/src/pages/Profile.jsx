import React from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { useSelector } from 'react-redux';
import {useRef, useState, useEffect} from 'react';
import { app } from '../firebase';
import { updateUserStart, 
        updateUserSuccess, 
        updatedUserFailure,
        deleteUserStart,
        deleteUserSuccess,
        deleteUserFailure, 
        signoutUserStart,
        signoutUserSuccess,
        signoutUserFailure} from '../redux/user/userSlice.js';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Profile() {
  const fileRef = useRef(null)
  const {currentUser, loading, error} = useSelector((state) => state.user)
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSucces, setUpdateSuccess] = useState(false);
  const [showListingsError, setshowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [, setDeleteListingsError] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if(file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);


    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / 
        snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      () => {
        setFileUploadError(true)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
        .then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
        });
      });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData, 
      [e.target.id] : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if(data.success === false) {
        dispatch(updatedUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
        dispatch(updatedUserFailure(error.message));
    }

  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(`/api/user/delete/${currentUser._id}`,{
        method: 'DELETE'
      });

      const data = await res.json();
      if(data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));

    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignOut = async () => {
    try {
      dispatch(signoutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();

      if(data.success === false) {
        dispatch(signoutUserFailure(data.message));
        return;
      }
      dispatch(signoutUserSuccess(data));

    } catch (error) {
      dispatch(signoutUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setshowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();

      if(data.success === false) {
        setshowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setshowListingsError(true);
    }
  }

  const handleDeleteListing = async (listingId) =>{
    try {
      setDeleteListingsError(false);
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      })
      const data = await res.json();

      if(data.success === false) {
        setDeleteListingsError(true);
        return;
      }
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));

    } catch (error) {
      setDeleteListingsError(true);
    }
  }

  

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={(e)=>setFile(e.target.files[0]) } type="file" ref={fileRef} hidden accept='image/*'/>
        <img onClick={()=>fileRef.current.click()} src={formData.avatar || currentUser.avatar} referrerPolicy="no-referrer" alt="profile" className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' />
        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>
        <input type='text' placeholder='username' className='border focus:outline-none p-3 rounded-lg' id='username' defaultValue={currentUser.username} onChange={handleChange}/>
        <input type='email' placeholder='email' className='border focus:outline-none p-3 rounded-lg' id='email' defaultValue={currentUser.email} onChange={handleChange}/>
        <input type='password' placeholder='password' className='border focus:outline-none p-3 rounded-lg' id='password' onChange={handleChange}/>
        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-90 disabled:opacity-80'>
        {loading ? 'Loading...' : 'Update'}
        </button>
        <Link to={"/create-listing"} className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'>
          Create Listing
        </Link>
      </form>

      <div className='flex justify-between mt-2'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>
          Delete account
        </span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>
      <p className='text-red-500 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>{updateSucces ? 'Successfully updated': ''}</p>
      <button onClick={handleShowListings} type='button' className='text-green-700 w-full'>Show Listings</button>
      <p className='text-red-500 mt-5'>{showListingsError ? 'Error showing listings' : '' }</p>
      {
        userListings && userListings.length > 0 && 
        <div className='flex flex-col gap-3'>
          <h1 className='font-semibold text-center text-2xl mt-6'>Your Listings</h1>
          {userListings.map((listing) => (
          <div className='flex justify-between items-center border p-5' key={listing._id}>
            <Link to={`/listing/${listing._id}`}>
              <img src={listing.imageUrls[0]} alt="listing cover" className='h-16 w-16 object-contain' />
            </Link>
            <Link className='flex-1 font-semibold text-slate-700 truncate hover:underline uppercase mx-5' to={`/listing/${listing._id}`}>
              <p>{listing.name}</p>
            </Link>
            <div className='flex flex-col gap-1'>
              <button onClick={() =>handleDeleteListing(listing._id)} className='text-red-700 uppercase' >Delete</button>
              <Link to={`/update-listing/${listing._id}`}>
                <button  className='text-green-700 uppercase'>Edit</button>
              </Link>
            </div>
          </div>
        ))}
        </div>
      }
    </div>
  )
}
