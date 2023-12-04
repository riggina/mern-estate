import React, {useState}  from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';

export default function CreateListing() {
  const navigate = useNavigate();
  const {currentUser} = useSelector(state => state.user)
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [files, setFiles] = useState({});
  const [ImageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log(formData);

  const handleImageSubmit = () => {
   
    if(files.length > 0 && files.length + formData.imageUrls.length < 7 ) {
      setUploading(true);
      setImageUploadError(false);
      const promises = []; //because want to upload more than 1 file

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
      .then((urls) => {
        setFormData({...formData, imageUrls: formData.imageUrls.concat(urls)});
        setImageUploadError(false);
        setUploading(false);
      })
      /* eslint-disable no-unused-vars */
      .catch((err) => {
        setImageUploadError('Image upload failed (2 mb max per image)');
        setUploading(false);
      });
    }else {
      setImageUploadError('You can only upload 6 images per listing');
      setUploading(false);
    }
  }

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / 
        snapshot.totalBytes) * 100;
        console.log(progress);
        },
        (error)=>{
          reject('Image upload failed (2 mb max per image) ');
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleImageDelete = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    })
  };

  const handleChange = (e) => {
    if(e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({
        ...formData,
        type: e.target.id
      })
    }

    if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
      setFormData({
        ...formData,
        [e.target.id] : e.target.checked
      })
    }

    if(e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea') {
      setFormData({
        ...formData,
        [e.target.id] : e.target.value,
      })
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(formData.imageUrls.length < 1) return setError('You must upload at least one image');
      if(+formData.regularPrice < +formData.discountPrice) return setError('Discount price must be lower than regular price')
      setLoading(true);
      setError(false);
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        })
      })
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      setLoading(false);
      navigate(`/listing/${data._id}`);
      
    } catch (error) {
        setError(error.message);
        setLoading(false);
    }

  }

  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input type="text" placeholder='Name' className='border p-3 rounded-lg' id='name' maxLength='62' minLength='10' onChange={handleChange} value={formData.name} required/>
          <textarea type="text" placeholder='Description' className='border p-3 rounded-lg' id='description' onChange={handleChange} value={formData.description} required/>
          <input type="text" placeholder='Address' className='border p-3 rounded-lg' id='address' onChange={handleChange} value={formData.address} required/>
          <div className='flex gap-6 flex-wrap mt-2'>
            <div className='flex gap-2'>
              <input type="checkbox" id="sale" className='w-4' onChange={handleChange} checked={formData.type === "sale"}  />
              <span>Sell</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id="rent" className='w-4' onChange={handleChange} checked={formData.type === "rent"} />
              <span>Rent</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id="parking" className='w-4' onChange={handleChange} checked={formData.parking}/>
              <span>Parking Spot</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id="furnished" className='w-4' onChange={handleChange} checked={formData.furnished}/>
              <span>Furnished</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id="offer" className='w-4' onChange={handleChange} checked={formData.offer} />
              <span>Offer</span>
            </div>
          </div>
          <div className='flex gap-6 flex-wrap'>
            <div className='flex gap-2 items-center'>
              <input type="number" id='bedrooms' min='1' max='10' className='p-2 rounded-md border border-gray-300 ' onChange={handleChange} value={formData.bedrooms} required />
              <p>Beds</p>
            </div>
            <div className='flex gap-2 items-center'>
              <input type="number" id='bathrooms' min='1' max='10' className='p-2 rounded-md border border-gray-300 ' onChange={handleChange} value={formData.bathrooms} required />
              <p>Baths</p>
            </div>
            <div className='flex gap-2 items-center'>
              <input type="number" min='50' max='10000000' id='regularPrice' className='p-2 rounded-md border border-gray-300' onChange={handleChange} value={formData.regularPrice} required />
              <div className='flex flex-col items-center'>
                <p>Regular Price</p>
                { formData.type === 'rent' && 
                (
                  <span className='text-xs'>($ / Month)</span>
                )}
              </div>
            </div>
            {formData.offer && (
              <div className='flex gap-2 items-center'>
              <input type="number" min='0' max='10000000' id='discountPrice' className='p-2 rounded-md border border-gray-300' onChange={handleChange} value={formData.discountPrice} required />
              <div className='flex flex-col items-center'>
                <p>Discounted Price</p>
                { formData.type === 'rent' && 
                (
                  <span className='text-xs'>($ / Month)</span>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>Images:
          <span className='px-2 font-normal text-sm text-gray-700'>The first image will be the cover (max 6)</span>
          </p>
          <div className='flex items-center gap-4'>
            <input onChange={(e) => setFiles(e.target.files)} className='p-3 border border-gray-300 rounded w-full' type="file" id='images' accept='image/*' multiple/>
            <button type='button' onClick={handleImageSubmit} className='p-2 max-h-10 text-green-700 border border-green-700 rounded-lg hover:bg-green-700 hover:text-white disabled:opacity-80'>{uploading ? 'Uploading...' : 'Upload'}</button>
          </div>
          <p className='text-red-700 text-sm'>{ImageUploadError && ImageUploadError}</p>
          {
            formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => (
              <div key={url} className='flex justify-between p-3 border border-slate-300 items-center rounded-md'>
                <img src={url} alt='listing image' className='w-20 h-20 object-contain rounded-md'/>
                <button disabled={uploading} type='button' onClick={() => handleImageDelete(index)} className='p-3 text-red-700 rounded-md hover:opacity-60'>Delete</button>
              </div>
            ))
          }
          <button disabled={loading || uploading} type='submit' className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>{loading ? 'Creating...' : 'Create Listing'}</button>
          <p className='text-red-500 mt-5'>{error}</p>
        </div>
      </form>
    </main>
  )
}
