// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useCommunityStore } from '../store/useCommunityStore';
// import { useAuthStore } from '../store/useAuthStore';
// import { Plus, Users, Search, ArrowRight, Loader2 } from 'lucide-react';
// import { toast } from 'react-hot-toast';

// export default function Communities() {
//   const { user } = useAuthStore();
//   const {
//     userCommunities,
//     loading,
//     fetchUserCommunities,
//     leaveCommunity,
//     createCommunity,
//   } = useCommunityStore();
  
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [newCommunity, setNewCommunity] = useState({ 
//     name: '', 
//     description: '',
//     isPrivate: false 
//   });

//   // Fetch user's communities on mount
//   useEffect(() => {
//     const loadData = async () => {
//       if (user) {
//         try {
//           await fetchUserCommunities();
//         } catch (error) {
//           toast.error('Failed to load your communities');
//         }
//       }
//     };
    
//     loadData();
//   }, [user, fetchUserCommunities]);

//   const handleCreateCommunity = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newCommunity.name.trim() || !newCommunity.description.trim()) {
//       toast.error('Please fill in all fields');
//       return;
//     }
    
//     setIsSubmitting(true);
//     try {
//       const createdCommunity = await createCommunity({
//         name: newCommunity.name.trim(),
//         description: newCommunity.description.trim(),
//         isPrivate: newCommunity.isPrivate
//       });
      
//       if (createdCommunity) {
//         toast.success('Community created successfully!');
//         setShowCreateModal(false);
//         setNewCommunity({ name: '', description: '', isPrivate: false });
//       } else {
//         throw new Error('Failed to create community');
//       }
//     } catch (error: any) {
//       const errorMessage = error.response?.data?.error || 'Error creating community. Please try again.';
//       console.error('Error creating community:', error);
//       toast.error(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Show loading state only on initial load
//   if (loading && userCommunities.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Communities</h1>
//             <p className="mt-1 sm:mt-2 text-sm text-gray-600">
//               Manage and interact with your developer communities
//             </p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//             <Link
//               to="/browse-communities"
//               className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               <Search className="-ml-1 mr-2 h-5 w-5" />
//               Browse Communities
//             </Link>
//             <button
//               onClick={() => setShowCreateModal(true)}
//               className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               <Plus className="-ml-1 mr-2 h-5 w-5" />
//               Create Community
//             </button>
//           </div>
//         </div>

//         {/* User's Communities */}
//         <div className="mb-12">
//           <div className="flex justify-between items-center mb-4">
//             <div>
//               <h2 className="text-lg font-medium text-gray-900">Your Communities</h2>
//               <p className="mt-1 text-sm text-gray-500">
//                 {loading ? 'Loading...' : `${userCommunities.length} community${userCommunities.length !== 1 ? 's' : ''}`}
//               </p>
//             </div>
//             <Link
//               to="/browse-communities"
//               className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               <Search className="-ml-1 mr-2 h-5 w-5" />
//               Browse Communities
//             </Link>
//           </div>
          
//           {loading && userCommunities.length === 0 ? (
//             <div className="flex justify-center py-12">
//               <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
//             </div>
//           ) : userCommunities.length > 0 ? (
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               {userCommunities.map((community) => (
//                 <div key={community.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
//                   <div className="p-6">
//                     <div className="flex items-start">
//                       <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
//                         <Users className={`h-6 w-6 ${community.isPrivate ? 'text-indigo-600' : 'text-indigo-500'}`} />
//                       </div>
//                       <div className="ml-4 flex-1">
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <h3 className="text-lg font-medium text-gray-900">{community.name}</h3>
//                             {community.isPrivate && (
//                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
//                                 Private
//                               </span>
//                             )}
//                           </div>
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//                             {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
//                           </span>
//                         </div>
//                         <p className="mt-2 text-sm text-gray-500 line-clamp-3">{community.description}</p>
//                         <div className="mt-4 flex justify-between items-center">
//                           <Link
//                             to={`/communities/${community.id}`}
//                             className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
//                           >
//                             View community <ArrowRight className="ml-1 h-4 w-4" />
//                           </Link>
//                           <button
//                             onClick={async () => {
//                               if (window.confirm(`Are you sure you want to leave ${community.name}?`)) {
//                                 const success = await leaveCommunity(community.id);
//                                 if (success) {
//                                   toast.success(`Left ${community.name}`);
//                                 }
//                               }
//                             }}
//                             className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                           >
//                             Leave
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12 bg-white shadow rounded-lg">
//               <Users className="mx-auto h-12 w-12 text-gray-400" />
//               <h3 className="mt-2 text-sm font-medium text-gray-900">No communities yet</h3>
//               <p className="mt-1 text-sm text-gray-500">Get started by joining a community or create your own.</p>
//               <div className="mt-6">
//                 <button
//                   onClick={() => setShowCreateModal(true)}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                 >
//                   <Plus className="-ml-1 mr-2 h-5 w-5" />
//                   Create Community
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Create Community Modal */}
//       {showCreateModal && (
//         <div 
//           className="fixed z-10 inset-0 overflow-y-auto"
//           onClick={() => setShowCreateModal(false)}
//         >
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//               <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
//             </div>
//             <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
//             <div 
//               className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
//               onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
//             >
//               <div>
//                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
//                   <Users className="h-6 w-6 text-indigo-600" />
//                 </div>
//                 <div className="mt-5">
//                   <form onSubmit={handleCreateCommunity} className="space-y-4">
//                     <div>
//                       <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//                         Community Name <span className="text-red-500">*</span>
//                       </label>
//                       <div className="mt-1">
//                         <input
//                           type="text"
//                           id="name"
//                           className={`block w-full rounded-md shadow-sm sm:text-sm ${
//                             !newCommunity.name.trim() && 'border-red-300 focus:ring-red-500 focus:border-red-500'
//                           }`}
//                           placeholder="Enter community name"
//                           value={newCommunity.name}
//                           onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
//                           disabled={isSubmitting}
//                         />
//                       </div>
//                       {!newCommunity.name.trim() && (
//                         <p className="mt-1 text-sm text-red-600">Community name is required</p>
//                       )}
//                     </div>
                    
//                     <div>
//                       <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//                         Description <span className="text-red-500">*</span>
//                       </label>
//                       <div className="mt-1">
//                         <textarea
//                           id="description"
//                           rows={4}
//                           className={`block w-full rounded-md shadow-sm sm:text-sm ${
//                             !newCommunity.description.trim() && 'border-red-300 focus:ring-red-500 focus:border-red-500'
//                           }`}
//                           placeholder="What's this community about?"
//                           value={newCommunity.description}
//                           onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
//                           disabled={isSubmitting}
//                         />
//                       </div>
//                       {!newCommunity.description.trim() && (
//                         <p className="mt-1 text-sm text-red-600">Description is required</p>
//                       )}
//                     </div>
                    
//                     <div className="flex items-center">
//                       <input
//                         id="isPrivate"
//                         name="isPrivate"
//                         type="checkbox"
//                         className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                         checked={newCommunity.isPrivate}
//                         onChange={(e) => setNewCommunity({ ...newCommunity, isPrivate: e.target.checked })}
//                         disabled={isSubmitting}
//                       />
//                       <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
//                         Make this community private
//                       </label>
//                     </div>
                    
//                     <p className="text-xs text-gray-500">
//                       Private communities require approval to join and are not visible to non-members.
//                     </p>
                    
//                     <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
//                       <button
//                         type="submit"
//                         className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:text-sm ${
//                           (!newCommunity.name.trim() || !newCommunity.description.trim() || isSubmitting)
//                             ? 'bg-indigo-400 cursor-not-allowed'
//                             : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
//                         }`}
//                         disabled={!newCommunity.name.trim() || !newCommunity.description.trim() || isSubmitting}
//                       >
//                         {isSubmitting ? (
//                           <>
//                             <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
//                             Creating...
//                           </>
//                         ) : (
//                           'Create Community'
//                         )}
//                       </button>
//                       <button
//                         type="button"
//                         className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:text-sm"
//                         onClick={() => setShowCreateModal(false)}
//                         // Removed disabled during isSubmitting to allow cancellation
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommunityStore } from '../store/useCommunityStore';
import { useAuthStore } from '../store/useAuthStore';
import { Plus, Users, Search, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Communities() {
  const { user } = useAuthStore();
  const {
    userCommunities,
    loading,
    fetchUserCommunities,
    leaveCommunity,
    createCommunity,
  } = useCommunityStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ 
    name: '', 
    description: '',
    isPrivate: false 
  });

  // Fetch user's communities on mount
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          await fetchUserCommunities();
        } catch (error) {
          toast.error('Failed to load your communities');
        }
      }
    };
    
    loadData();
  }, [user, fetchUserCommunities]);

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) {
      toast.error('Name and description are required');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Starting community creation:', newCommunity); // Debug log
    try {
      const createdCommunity = await createCommunity({
        name: newCommunity.name.trim(),
        description: newCommunity.description.trim(),
        isPrivate: newCommunity.isPrivate
      });
      
      if (createdCommunity) {
        console.log('Community creation succeeded:', createdCommunity); // Debug log
        toast.success('Community created successfully!');
        setNewCommunity({ name: '', description: '', isPrivate: false });
      } else {
        throw new Error('Failed to create community');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error creating community. Please try again.';
      console.error('Create community error:', error); // Debug log
      toast.error(errorMessage);
    } finally {
      console.log('Finishing community creation, isSubmitting:', false); // Debug log
      setIsSubmitting(false);
      setShowCreateModal(false); // Force modal closure
    }
  };

  // Show loading state only on initial load
  if (loading && userCommunities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Communities</h1>
            <p className="mt-1 sm:mt-2 text-sm text-gray-600">
              Manage and interact with your developer communities
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/browse-communities"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Search className="-ml-1 mr-2 h-5 w-5" />
              Browse Communities
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Create Community
            </button>
          </div>
        </div>

        {/* User's Communities */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Your Communities</h2>
              <p className="mt-1 text-sm text-gray-500">
                {loading ? 'Loading...' : `${userCommunities.length} community${userCommunities.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          
          {loading && userCommunities.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : userCommunities.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userCommunities.map((community) => (
                <div key={community.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                        <Users className={`h-6 w-6 ${community.isPrivate ? 'text-indigo-600' : 'text-indigo-500'}`} />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{community.name}</h3>
                            {community.isPrivate && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                Private
                              </span>
                            )}
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 line-clamp-3">{community.description}</p>
                        <div className="mt-4 flex justify-between items-center">
                          <Link
                            to={`/communities/${community.id}`}
                            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            View community <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to leave ${community.name}?`)) {
                                const success = await leaveCommunity(community.id);
                                if (success) {
                                  toast.success(`Left ${community.name}`);
                                }
                              }
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Leave
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No communities yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by joining a community below or create your own.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Create Community
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Simplified Create Community Modal (from working version) */}
        {showCreateModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={() => setShowCreateModal(false)}
            aria-label="Close modal"
          >
            <div 
              className="bg-white p-6 rounded-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-medium mb-4">Create Community</h2>
              <form onSubmit={handleCreateCommunity} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-2 border rounded"
                    placeholder="Community name"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="w-full p-2 border rounded"
                    placeholder="What's this community about?"
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="isPrivate"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600"
                    checked={newCommunity.isPrivate}
                    onChange={(e) => setNewCommunity({ ...newCommunity, isPrivate: e.target.checked })}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="isPrivate" className="ml-2 text-sm">
                    Private
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2 rounded text-white ${
                      isSubmitting || !newCommunity.name.trim() || !newCommunity.description.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={isSubmitting || !newCommunity.name.trim() || !newCommunity.description.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="inline animate-spin h-5 w-5 mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
