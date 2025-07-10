import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { AppContext } from '@/context/AppContext';
import { useContext } from 'react';


export default function GeneralSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { appSettings, setAppSettings } = useContext(AppContext);
  const [softwareTitle, setSoftwareTitle] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [timezone, setTimezone] = useState('');
  const [displayType, setDisplayType] = useState('logo');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/access-denied');
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/app-config');
        const data = await res.json();
        if (res.ok) {
          setSoftwareTitle(data.softwareTitle);
          setLogoUrl(data.logoUrl);
          setTimezone(data.timezone);
          setDisplayType(data.displayType || 'logo');
        } else {
          setError(data.error || 'Failed to fetch settings');
        }
      } catch (err) {
        setError('An error occurred while fetching settings');
        console.error(err);
      }
    };
    fetchSettings();
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      let newLogoUrl = logoUrl;
      if (logoFile) {
        const formData = new FormData();
        formData.append('image', logoFile);
        const uploadRes = await fetch('/api/save-image', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          newLogoUrl = uploadData.imageUrl;
        } else {
          setError(uploadData.error || 'Failed to upload logo');
          return;
        }
      }

      const res = await fetch('/api/settings/app-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ softwareTitle, logoUrl: newLogoUrl, timezone, displayType }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Settings updated successfully!');
        setLogoUrl(newLogoUrl); // Update logoUrl state with the new URL
        setAppSettings({ ...appSettings, softwareTitle, logoUrl: newLogoUrl, displayType });
      } else {
        setError(data.error || 'Failed to update settings');
      }
    } catch (err) {
      setError('An error occurred while updating settings');
      console.error(err);
    }
  };

  if (status === 'loading' || !session || session.user.role !== 'admin') {
    return <Layout>Loading...</Layout>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">General Settings</h1>
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="softwareTitle" className="block text-sm font-medium text-gray-700">Software Title</label>
          <input
            type="text"
            id="softwareTitle"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={softwareTitle}
            onChange={(e) => setSoftwareTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="logoFile" className="block text-sm font-medium text-gray-700">Upload Logo</label>
          <input
            type="file"
            id="logoFile"
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            onChange={(e) => setLogoFile(e.target.files[0])}
          />
          {logoUrl && <p className="mt-2 text-sm text-gray-500">Current Logo: <img src={logoUrl} alt="Current Logo" className="h-10 w-10 object-contain inline-block" /></p>}
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Timezone</label>
          <input
            type="text"
            id="timezone"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Display Type</label>
          <div className="mt-1 flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="displayType"
                value="logo"
                checked={displayType === 'logo'}
                onChange={(e) => setDisplayType(e.target.value)}
              />
              <span className="ml-2 text-gray-700">Logo</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="displayType"
                value="text"
                checked={displayType === 'text'}
                onChange={(e) => setDisplayType(e.target.value)}
              />
              <span className="ml-2 text-gray-700">Text Title</span>
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
