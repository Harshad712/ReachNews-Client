import { useEffect, useState } from "react";
import { User, X, Bookmark, Check, Filter, LogOut, XCircle, BookOpen, Home } from "lucide-react";
import { Button } from "./components/ui/button";
import { fetchNewsData } from "./utils/api";
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNavigate } from 'react-router-dom';
import nhost from './nhost';
import { loadUserPreferences, saveUserPreferences } from './utils/storage';

const ITEMS_PER_PAGE = 9;
const PREFERENCES = [
  "Technology",
  "Business",
  "Politics",
  "Sports",
  "Entertainment",
  "Health",
];

function Dashboard() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [readNews, setReadNews] = useState(new Set());
  const [savedNews, setSavedNews] = useState(new Set());
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const [displayMode, setDisplayMode] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await nhost.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        setUser(user);
        // Load saved preferences
        const preferences = loadUserPreferences(user.id);
        setReadNews(preferences.readNews);
        setSavedNews(preferences.savedNews);
        setSelectedPreferences(preferences.preferences);
        setDisplayMode(preferences.displayMode);
      }
    };
    checkAuth();
  }, [navigate]);

  // Save preferences whenever they change
  useEffect(() => {
    if (user) {
      saveUserPreferences(user.id, {
        readNews,
        savedNews,
        preferences: selectedPreferences,
        displayMode
      });
    }
  }, [user, readNews, savedNews, selectedPreferences, displayMode]);

  useEffect(() => {
    const getNews = async () => {
      try {
        const newsData = await fetchNewsData("");
        setNews(newsData);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    getNews();
  }, []);

  const handleLogout = async () => {
    if (user) {
      // Clear preferences before logout
      localStorage.removeItem(`user_preferences_${user.id}`);
    }
    await nhost.auth.signOut();
    navigate('/login');
  };

  const filteredNews = news.filter(item => {
    if (displayMode === 'saved') {
      return savedNews.has(item.id);
    }
    if (displayMode === 'read') {
      return readNews.has(item.id);
    }
    if (selectedPreferences.length === 0) {
      return true;
    }
    return selectedPreferences.some(pref => 
      item.category?.toLowerCase().includes(pref.toLowerCase()) ||
      item.news_content?.toLowerCase().includes(pref.toLowerCase()) ||
      item.news_summary?.toLowerCase().includes(pref.toLowerCase())
    );
  });

  const displayedNews = filteredNews.slice(0, visibleItems);

  const openNewsModal = (newsItem) => {
    setSelectedNews(newsItem);
    document.body.style.overflow = 'hidden';
  };

  const closeNewsModal = () => {
    setSelectedNews(null);
    document.body.style.overflow = 'unset';
  };

  const toggleRead = (e, newsId) => {
    e.stopPropagation();
    setReadNews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(newsId)) {
        newSet.delete(newsId);
      } else {
        newSet.add(newsId);
      }
      return newSet;
    });
  };

  const toggleSave = (e, newsId) => {
    e.stopPropagation();
    setSavedNews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(newsId)) {
        newSet.delete(newsId);
      } else {
        newSet.add(newsId);
      }
      return newSet;
    });
  };

  const handleShowMore = () => {
    setVisibleItems(prev => prev + ITEMS_PER_PAGE);
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">ReachNews</h1>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => {
                    setDisplayMode('all');
                    setVisibleItems(ITEMS_PER_PAGE);
                  }}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                    displayMode === 'all'
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Home</span>
                </button>

                <button
                  onClick={() => setDisplayMode(displayMode === 'all' ? 'saved' : 'all')}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                    displayMode === 'saved'
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Saved ({savedNews.size})</span>
                  <span className="sm:hidden">{savedNews.size}</span>
                </button>

                <button
                  onClick={() => setDisplayMode(displayMode === 'all' ? 'read' : 'all')}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                    displayMode === 'read'
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Read ({readNews.size})</span>
                  <span className="sm:hidden">{readNews.size}</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:block text-sm text-gray-600">
                    {user.displayName || user.metadata?.name || user.email}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline ml-2">Logout</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col items-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest News</h2>
          <p className="mt-2 text-gray-600">Stay informed with the latest updates</p>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                  <span>{selectedPreferences.length ? `${selectedPreferences.length} selected` : 'Select preferences'}</span>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content className="bg-white rounded-lg shadow-lg border p-2 min-w-[200px]">
                  {PREFERENCES.map((pref) => (
                    <DropdownMenu.Item
                      key={pref}
                      className="relative flex items-center px-8 py-2 text-gray-700 hover:bg-blue-50 rounded cursor-pointer"
                      onClick={() => {
                        setSelectedPreferences(prev =>
                          prev.includes(pref)
                            ? prev.filter(p => p !== pref)
                            : [...prev, pref]
                        );
                      }}
                    >
                      {pref}
                      {selectedPreferences.includes(pref) && (
                        <Check className="w-4 h-4 absolute left-2" />
                      )}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>

              {selectedPreferences.length > 0 && (
                <button
                  onClick={() => setSelectedPreferences([])}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading news...</p>
          </div>
        ) : displayedNews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {displayMode === 'saved' ? 'No saved articles yet.' : displayMode === 'read' ? 'No read articles yet.' : 'No news available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedNews.map((item) => (
              <article 
                key={item.id} 
                className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer"
                onClick={() => openNewsModal(item)}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-3">
                    <time className="text-sm text-gray-500">{item.news_date}</time>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                      {item.sentiment || 'Neutral'}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg sm:text-xl font-semibold text-gray-900 line-clamp-2">{item.news_title}</h3>
                  <p className="mt-3 text-sm sm:text-base text-gray-600 line-clamp-3">{item.news_summary}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-600">{item.news_author}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button
                              onClick={(e) => toggleSave(e, item.id)}
                              className={`p-2 rounded-full transition-colors duration-200 ${
                                savedNews.has(item.id) 
                                  ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' 
                                  : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
                              }`}
                            >
                              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" fill={savedNews.has(item.id) ? "currentColor" : "none"} />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Content
                            className="bg-gray-900 text-white px-3 py-1.5 rounded text-sm"
                            sideOffset={5}
                          >
                            {savedNews.has(item.id) ? 'Remove from saved' : 'Save article'}
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                      
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button
                              onClick={(e) => toggleRead(e, item.id)}
                              className={`p-2 rounded-full transition-colors duration-200 ${
                                readNews.has(item.id)
                                  ? 'text-green-500 bg-green-50 hover:bg-green-100'
                                  : 'text-gray-400 hover:text-green-500 hover:bg-gray-100'
                              }`}
                            >
                              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Content
                            className="bg-gray-900 text-white px-3 py-1.5 rounded text-sm"
                            sideOffset={5}
                          >
                            {readNews.has(item.id) ? 'Mark as unread' : 'Mark as read'}
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {filteredNews.length > visibleItems && (
          <div className="text-center mt-8 sm:mt-12">
            <Button 
              variant="outline" 
              className="text-blue-600 hover:bg-blue-50 border-blue-200"
              onClick={handleShowMore}
            >
              Show More News ↓
            </Button>
          </div>
        )}
      </main>

      <Dialog.Root open={!!selectedNews} onOpenChange={() => closeNewsModal()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto z-[999]">
            {selectedNews && (
              <>
                <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{selectedNews.news_title}</h3>
                  <Dialog.Close className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Dialog.Close>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <time className="text-sm text-gray-500">{selectedNews.news_date}</time>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(selectedNews.sentiment)}`}>
                      {selectedNews.sentiment || 'Neutral'}
                    </span>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 mb-6">{selectedNews.news_summary}</p>
                    {selectedNews.news_content && (
                      <p className="text-gray-700 mb-6">{selectedNews.news_content}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <div className="flex items-center">
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 bg-gray-100 rounded-full p-1" />
                      <span className="ml-2 text-sm text-gray-600">{selectedNews.news_author}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => toggleSave(e, selectedNews.id)}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          savedNews.has(selectedNews.id) 
                            ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' 
                            : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" fill={savedNews.has(selectedNews.id) ? "currentColor" : "none"} />
                      </button>
                      
                      <button
                        onClick={(e) => toggleRead(e, selectedNews.id)}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          readNews.has(selectedNews.id)
                            ? 'text-green-500 bg-green-50 hover:bg-green-100'
                            : 'text-gray-400 hover:text-green-500 hover:bg-gray-100'
                        }`}
                      >
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      
                      {selectedNews.news_url && (
                        <a
                          href={selectedNews.news_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                        >
                          Read More →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default Dashboard;