import React, { useState, useRef, useEffect, useCallback } from "react";

// --- INTERFACES MATCHING JAVA BACKEND DTOs (UPDATED) ---
interface User { id: number; name: string; email: string; mobile: string; password?: string; }
interface Court { id: number; venueId: number; sportName: string; courtName: string; pricePlanId: number; }
interface PricePlan { id: number; name: string; timeSlot: string; weekdayPrice: number; weekendPrice: number; } // NEW
interface Booking { id: number; userName: string; sportName: string; venue: string; courtName: string; date: string; timeSlot: string; price: number; status: string; }
interface Sport { id: number; name: string; courtCount: number; icon: string; color: string; }
interface Venue { id: number; name: string; address: string; city: string; }

// --- DUMMY DATA ---
const API_BASE_URL = "http://localhost:8080/api";

// --- START: PRINT-SPECIFIC CSS ---
const printStyles = `
@media print {
    /* Hide the header and sidebar */
    .print-hide {
        display: none !important;
    }
    /* Ensure the main content area expands to full width */
    body > .min-h-screen > .flex {
        display: block !important;
    }
    /* Remove the fixed margin from the main content so it starts at the top */
    .pt-16 { 
        padding-top: 0 !important;
    }
    /* Isolate and style the user table area for a clean report look */
    #admin-dashboard-container {
        margin: 0 !important;
        padding: 20px; 
    }
    /* Hide the dashboard overview cards and other non-table elements */
    .dashboard-metrics, #admin-sidebar, .admin-header {
        display: none;
    }
    /* Ensure the table itself is visible and centered */
    #user-management-section, #bookings-management-section, #price-management-section {
        width: 100%;
        padding-top: 0;
    }
}
`;
// --- END: PRINT-SPECIFIC CSS ---

// --- ADMIN UI COMPONENTS (MOVED OUTSIDE APP FOR STABILITY) ---

interface AdminLoginProps {
    showLogin: boolean;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    handleAdminLogin: (e: React.FormEvent) => void;
    handleAdminSignup: (e: React.FormEvent) => void;
    setAdminName: React.Dispatch<React.SetStateAction<string>>;
    setAdminEmail: React.Dispatch<React.SetStateAction<string>>;
    setAdminPassword: React.Dispatch<React.SetStateAction<string>>;
    setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminLoginSignup: React.FC<AdminLoginProps> = (props) => (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-md mx-auto bg-black border border-blue-600 rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          {props.showLogin ? 'Admin Login' : 'Admin Sign Up'}
        </h2>
        <form onSubmit={props.showLogin ? props.handleAdminLogin : props.handleAdminSignup} className="space-y-6">
          {!props.showLogin && (
            <input
              type="text"
              placeholder="Admin Name"
              className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:border-blue-600"
              value={props.adminName}
              onChange={(e) => props.setAdminName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:border-blue-600"
            value={props.adminEmail}
            onChange={(e) => props.setAdminEmail(e.target.value)}
              required
            />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:border-blue-600"
            value={props.adminPassword}
            onChange={(e) => props.setAdminPassword(e.target.value)}
            required
          />
          {!props.showLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:border-blue-600"
              required
            />
          )}
          {props.showLogin && (
              <div className="flex justify-between text-sm text-gray-400">
                  <label className="flex items-center">
                      <input type="checkbox" className="mr-2 rounded text-blue-600" />
                      Remember Me
                  </label>
                  <a href="#" className="text-blue-500 hover:text-blue-400">Forgot Password?</a>
              </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {props.showLogin ? 'Login as Admin' : 'Sign Up as Admin'}
          </button>
          <p className="text-center text-gray-400">
            {props.showLogin ? 'Need an account?' : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                  props.setShowLogin(!props.showLogin);
                  props.setAdminName("");
                  props.setAdminEmail("");
                  props.setAdminPassword("");
              }}
              className="text-blue-500 underline ml-2"
            >
              {props.showLogin ? 'Login' : 'Sign up'}
            </button>
          </p>
        </form>
      </div>
    </div>
);

const MetricCard = ({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) => (
    <div className="p-5 rounded-lg bg-gray-900 shadow-xl border-l-4" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <div className="text-white">
                <p className="text-xl font-bold">{value}</p>
                <p className="text-sm text-gray-400">{title}</p>
            </div>
            <i className={`fas ${icon} text-3xl`} style={{ color: color }}></i>
        </div>
    </div>
);


interface AdminDashboardProps {
    adminUsers: User[];
    adminBookings: Booking[];
    adminSports: Sport[];
    adminVenues: Venue[]; 
    adminCourts: Court[]; 
    adminPrices: PricePlan[]; // NEW
    activeAdminSection: string;
    handleAddCourt: (sport: Sport) => void;
    handleDeleteSport: (sportId: number, sportName: string) => void;
    printUserList: () => void;
    
    // Sport Handlers
    setShowAddSportModal: React.Dispatch<React.SetStateAction<boolean>>;
    showAddSportModal: boolean;
    newSportName: string;
    setNewSportName: React.Dispatch<React.SetStateAction<string>>;
    newSportCourts: number;
    setNewSportCourts: React.Dispatch<React.SetStateAction<number>>;
    handleAddNewSport: (e: React.FormEvent) => void;
    
    // Venue Handlers
    setShowAddVenueModal: React.Dispatch<React.SetStateAction<boolean>>;
    showAddVenueModal: boolean;
    newVenueName: string;
    setNewVenueName: React.Dispatch<React.SetStateAction<string>>;
    newVenueAddress: string;
    setNewVenueAddress: React.Dispatch<React.SetStateAction<string>>;
    handleAddNewVenue: (e: React.FormEvent) => void;

    // Court Handlers
    setShowAddCourtModal: React.Dispatch<React.SetStateAction<boolean>>;
    showAddCourtModal: boolean;
    newCourtVenueId: number;
    setNewCourtVenueId: React.Dispatch<React.SetStateAction<number>>;
    newCourtSportName: string;
    setNewCourtSportName: React.Dispatch<React.SetStateAction<string>>;
    newCourtName: string;
    setNewCourtName: React.Dispatch<React.SetStateAction<string>>;
    newCourtPricePlanId: number;
    setNewCourtPricePlanId: React.Dispatch<React.SetStateAction<number>>;
    handleAddNewCourt: (e: React.FormEvent) => void;
    
    // Price Handlers
    setShowAddPriceModal: React.Dispatch<React.SetStateAction<boolean>>; // NEW
    showAddPriceModal: boolean; // NEW
    newPriceTimeSlot: string; // NEW
    setNewPriceTimeSlot: React.Dispatch<React.SetStateAction<string>>; // NEW
    newPriceWeekday: number; // NEW
    setNewPriceWeekday: React.Dispatch<React.SetStateAction<number>>; // NEW
    newPriceWeekend: number; // NEW
    setNewPriceWeekend: React.Dispatch<React.SetStateAction<number>>; // NEW
    handleAddNewPricePlan: (e: React.FormEvent) => void; // NEW
    handleDeletePricePlan: (planId: number, planName: string) => void; // NEW
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUsers, adminSports, adminBookings, adminVenues, adminCourts, adminPrices, activeAdminSection, handleAddCourt, handleDeleteSport, printUserList, setShowAddSportModal, showAddSportModal, newSportName, setNewSportName, newSportCourts, setNewSportCourts, handleAddNewSport, setShowAddVenueModal, showAddVenueModal, newVenueName, setNewVenueName, newVenueAddress, setNewVenueAddress, handleAddNewVenue, setShowAddCourtModal, showAddCourtModal, newCourtVenueId, setNewCourtVenueId, newCourtSportName, setNewCourtSportName, newCourtName, setNewCourtName, newCourtPricePlanId, setNewCourtPricePlanId, handleAddNewCourt, setShowAddPriceModal, showAddPriceModal, newPriceTimeSlot, setNewPriceTimeSlot, newPriceWeekday, setNewPriceWeekday, newPriceWeekend, setNewPriceWeekend, handleAddNewPricePlan, handleDeletePricePlan }) => {
    
    // ... (unchanged search/filter logic)
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [bookingSearchTerm, setBookingSearchTerm] = useState('');
    const [bookingFilterSport, setBookingFilterSport] = useState('');
    const [bookingFilterStatus, setBookingFilterStatus] = useState('');
    
    const filteredUsers = adminUsers.filter(user => {
        const term = userSearchTerm.toLowerCase();
        return (
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.mobile.includes(term)
        );
    });

    const filteredBookings = adminBookings.filter(booking => {
        const term = bookingSearchTerm.toLowerCase();
        const matchesSearch = 
            booking.userName.toLowerCase().includes(term) ||
            booking.date.includes(term);
        
        const matchesSport = bookingFilterSport ? booking.sportName === bookingFilterSport : true;
        const matchesStatus = bookingFilterStatus ? booking.status === bookingFilterStatus : true;
        
        return matchesSearch && matchesSport && matchesStatus;
    });

    // Helper to get Venue Name from ID
    const getVenueName = (venueId: number) => {
        return adminVenues.find(v => v.id === venueId)?.name || 'Unknown Venue';
    };
    
    // Helper to get Price Plan Name from ID
    const getPricePlanName = (planId: number) => {
        return adminPrices.find(p => p.id === planId)?.name || `ID ${planId} (Missing)`;
    };
    
    const totalCourts = adminCourts.length;

    const UserManagementTable = () => (
        <div id="user-management-section">
            <h2 className="text-2xl font-semibold text-white mb-4">User Management</h2>
            <div className="flex justify-between mb-4 print-hide">
                <input 
                    type="text" 
                    placeholder="Search users by Name, Email, or Phone..." 
                    className="px-4 py-2 w-1/3 bg-gray-900 text-white border border-gray-700 rounded-lg"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                />
                <button 
                    onClick={printUserList} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                    <i className="fas fa-file-export mr-2"></i>Export Users
                </button>
            </div>
            {/* Printable Title */}
            <div className="hidden print:block text-2xl font-bold mb-4 text-black">User List Report - {new Date().toLocaleDateString()}</div>

            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700 print:text-black print:border-black">
                    <thead className="bg-blue-800 print:bg-blue-200">
                        <tr>
                            {['No', 'Name', 'Phone Number', 'Email ID'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:text-black">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 print:bg-white print:divide-gray-400">
                        {filteredUsers.map((user, index) => (
                            <tr key={user.id} className={index % 2 === 0 ? 'bg-gray-900 text-gray-300 print:bg-gray-100 print:text-black' : 'bg-black text-gray-300 print:bg-white print:text-black'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.mobile}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-4 text-gray-400 print-hide">
                <span>Showing 1 to {filteredUsers.length} of {adminUsers.length} entries</span>
                <div className="flex space-x-1">
                    <button className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700">Previous</button>
                    <button className="px-3 py-1 rounded-lg bg-blue-600 text-white">1</button>
                    <button className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700">Next</button>
                </div>
            </div>
        </div>
    );

    const VenueManagementTable = () => (
        <div id="venue-management-section">
            <h2 className="text-2xl font-semibold text-white mb-4">Venue & Court Management</h2>
            <div className="flex justify-end mb-4 print-hide">
                <button 
                    onClick={() => setShowAddVenueModal(true)} 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold mr-2"
                >
                    <i className="fas fa-plus mr-2"></i>Add New Venue
                </button>
                <button 
                    onClick={() => setShowAddCourtModal(true)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                    <i className="fas fa-plus mr-2"></i>Add New Court
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-700 mb-8">
                <h3 className="text-xl font-semibold text-white p-3 bg-gray-800">Venues</h3>
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            {['ID', 'Venue Name', 'Address', 'Courts', 'Actions'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {adminVenues.map((venue, index) => {
                             const venueCourtCount = adminCourts.filter(c => c.venueId === venue.id).length;
                            return (
                            <tr key={venue.id} className={index % 2 === 0 ? 'bg-gray-900 text-gray-300' : 'bg-black text-gray-300'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{venue.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{venue.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{venue.address}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{venueCourtCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 print-hide">
                                    <button 
                                        onClick={() => alert(`View details for Venue ID: ${venue.id}`)}
                                        className="bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-yellow-700"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white p-3 bg-gray-800">Individual Courts</h3>
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            {['ID', 'Venue', 'Sport', 'Court Name', 'Price Plan', 'Actions'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {adminCourts.map((court, index) => (
                            <tr key={court.id} className={index % 2 === 0 ? 'bg-gray-900 text-gray-300' : 'bg-black text-gray-300'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{court.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{getVenueName(court.venueId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{court.sportName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{court.courtName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{getPricePlanName(court.pricePlanId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 print-hide">
                                    <button 
                                        onClick={() => alert(`Delete Court ID: ${court.id}`)}
                                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const PriceManagementTable = () => (
        <div id="price-management-section">
            <h2 className="text-2xl font-semibold text-white mb-4">Price Plan Management</h2>
            <div className="flex justify-end mb-4 print-hide">
                <button 
                    onClick={() => setShowAddPriceModal(true)} 
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold"
                >
                    <i className="fas fa-plus mr-2"></i>Add New Price Plan
                </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-purple-800">
                        <tr>
                            {['ID', 'Plan Name', 'Time Slot', 'Weekday Price (₹)', 'Weekend Price (₹)', 'Actions'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {adminPrices.map((plan, index) => (
                            <tr key={plan.id} className={index % 2 === 0 ? 'bg-gray-900 text-gray-300' : 'bg-black text-gray-300'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{plan.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{plan.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{plan.timeSlot}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">₹{plan.weekdayPrice}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">₹{plan.weekendPrice}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 print-hide">
                                    <button 
                                        onClick={() => handleDeletePricePlan(plan.id, plan.name)}
                                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    // Placeholder for SportsManagementTable (unchanged)
    const SportsManagementTable = () => (
        <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Sports/Court Count Management</h2>
            <p className="text-gray-400 mb-4">Note: Individual court tracking is now handled under the **Venues** section.</p>
            <div className="flex justify-end mb-4 print-hide">
                <button 
                    onClick={() => setShowAddSportModal(true)} // Open Modal
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                    <i className="fas fa-plus mr-2"></i>Add New Sport
                </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700 print:text-black print:border-black">
                    <thead className="bg-blue-800 print:bg-blue-200">
                        <tr>
                            {['No', 'Name of Sports', 'Total Number of Courts (Old Metric)', 'Actions'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:text-black">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 print:bg-white print:divide-gray-400">
                        {adminSports.map((sport, index) => (
                            <tr key={sport.id} className={index % 2 === 0 ? 'bg-gray-900 text-gray-300 print:bg-gray-100 print:text-black' : 'bg-black text-gray-300 print:bg-white print:text-black'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{sport.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{sport.courtCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 print-hide">
                                    <button 
                                        onClick={() => handleAddCourt(sport)} // Pass the entire sport object
                                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700"
                                    >
                                        <i className="fas fa-plus mr-1"></i> Add Court (Mock)
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteSport(sport.id, sport.name)} // Pass ID and Name
                                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700"
                                    >
                                        <i className="fas fa-trash-alt mr-1"></i> Delete Sport
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );


    const BookingsManagementTable = () => (
        // ... (unchanged BookingsManagementTable, except for PricePlan integration is now needed)
        <div id="bookings-management-section">
            <h2 className="text-2xl font-semibold text-white mb-4">Bookings Management</h2>
            <div className="flex space-x-4 mb-4 print-hide">
                {/* Search Input */}
                <input 
                    type="text" 
                    placeholder="Search by Name or Date..." 
                    className="px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg w-1/4"
                    value={bookingSearchTerm}
                    onChange={(e) => setBookingSearchTerm(e.target.value)}
                />
                {/* Filter by Sport */}
                <select 
                    className="px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                    value={bookingFilterSport}
                    onChange={(e) => setBookingFilterSport(e.target.value)}
                >
                    <option value="">Filter by Sport</option>
                    {adminSports.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                {/* Filter by Status */}
                <select 
                    className="px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                    value={bookingFilterStatus}
                    onChange={(e) => setBookingFilterStatus(e.target.value)}
                >
                    <option value="">Filter by Status</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                {/* Mock Print Button */}
                 <button 
                    onClick={printUserList} // Using printUserList for simplicity, assumes it prints current page content
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                    <i className="fas fa-print mr-2"></i>Print Bookings
                </button>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-blue-800">
                        <tr>
                            {['No', 'Name', 'Sport', 'Venue', 'Court', 'Date', 'Time', 'Rupees', 'Status'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredBookings.map((booking, index) => {
                            const statusColor = booking.status === 'Confirmed' ? 'bg-green-500' : booking.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500';
                            return (
                            <tr key={booking.id} className={index % 2 === 0 ? 'bg-gray-900 text-gray-300' : 'bg-black text-gray-300'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.userName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.sportName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.venue}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.courtName}</td> {/* NEW */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.timeSlot}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">₹{booking.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${statusColor}`}>
                                        {booking.status}
                                    </span>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    );


    return (
        <div id="admin-dashboard-container" className="flex-1 p-8 bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold text-white mb-6 print-hide">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 dashboard-metrics print-hide">
                <MetricCard title="Total Users" value={adminUsers.length} icon="fa-users" color="#3B82F6" />
                <MetricCard title="Total Sports" value={adminSports.length} icon="fa-racquet" color="#10B981" />
                <MetricCard title="Total Courts" value={totalCourts} icon="fa-dumbbell" color="#F97316" /> 
                <MetricCard title="Total Bookings" value={adminBookings.length} icon="fa-calendar-day" color="#EF4444" />
            </div>

            <div className="bg-black p-6 rounded-xl shadow-lg border border-blue-600 print:bg-white print:p-0 print:border-none print:shadow-none">
                {activeAdminSection === "Dashboard" && (
                    <div className="print-hide">
                        <h2 className="text-2xl font-semibold text-white mb-4">Admin Home</h2>
                        <p className="text-gray-400">Welcome back, Admin! Use the sidebar to manage your courts, users, and bookings.</p>
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-white mb-4">Revenue Analytics (Mock)</h3>
                            <div className="bg-gray-900 h-64 rounded-lg flex items-center justify-center text-gray-500">
                                [Placeholder for Revenue Chart: Daily/Monthly Earnings]
                            </div>
                        </div>
                    </div>
                )}
                {activeAdminSection === "Users" && <UserManagementTable />}
                {activeAdminSection === "Sports" && <SportsManagementTable />}
                {activeAdminSection === "Venues" && <VenueManagementTable />} 
                {activeAdminSection === "Prices" && <PriceManagementTable />} {/* NEW SECTION */}
                {activeAdminSection === "Bookings" && <BookingsManagementTable />}
            </div>

            {/* ADD NEW SPORT MODAL (unchanged) */}
            {showAddSportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <form onSubmit={handleAddNewSport} className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold text-white mb-6">Add New Sport</h3>
                        
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Sport Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                                value={newSportName}
                                onChange={(e) => setNewSportName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">Total Courts (Min: 1) - Old Metric</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                                value={newSportCourts}
                                min="1"
                                onChange={(e) => setNewSportCourts(parseInt(e.target.value) || 1)}
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowAddSportModal(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                            >
                                Save Sport
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* ADD NEW VENUE MODAL (unchanged) */}
            {showAddVenueModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <form onSubmit={handleAddNewVenue} className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold text-white mb-6">Add New Venue</h3>
                        
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Venue Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Sports Arena - Satellite"
                                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                                value={newVenueName}
                                onChange={(e) => setNewVenueName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">Venue Address</label>
                            <input
                                type="text"
                                placeholder="Full Address of the location"
                                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                                value={newVenueAddress}
                                onChange={(e) => setNewVenueAddress(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowAddVenueModal(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
                            >
                                Save Venue
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* ADD NEW COURT MODAL (updated with all prices) */}
            {showAddCourtModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <form onSubmit={handleAddNewCourt} className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold text-white mb-6">Add New Individual Court</h3>
                        
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Select Venue</label>
                            <select 
                                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                                value={newCourtVenueId}
                                onChange={(e) => setNewCourtVenueId(parseInt(e.target.value) || 0)}
                                required
                            >
                                <option value={0}>-- Select Venue --</option>
                                {adminVenues.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Select Sport</label>
                            <select 
                                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                                value={newCourtSportName}
                                onChange={(e) => setNewCourtSportName(e.target.value)}
                                required
                            >
                                <option value="">-- Select Sport --</option>
                                {adminSports.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Court Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Court 1, Turf B"
                                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                                value={newCourtName}
                                onChange={(e) => setNewCourtName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">Select Price Plan</label>
                            <select
                                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                                value={newCourtPricePlanId}
                                onChange={(e) => setNewCourtPricePlanId(parseInt(e.target.value) || 0)}
                                required
                            >
                                <option value={0}>-- Select Price Plan --</option>
                                {adminPrices.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (₹{p.weekdayPrice}/₹{p.weekendPrice})</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Note: You must create Price Plans in the "Prices" section first.</p>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowAddCourtModal(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                            >
                                Save Court
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* ADD NEW PRICE MODAL (NEW) */}
            {showAddPriceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <form onSubmit={handleAddNewPricePlan} className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold text-white mb-6">Create New Price Plan</h3>
                        
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Time Slot (Must match user options)</label>
                            <select
                                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                                value={newPriceTimeSlot}
                                onChange={(e) => setNewPriceTimeSlot(e.target.value)}
                                required
                            >
                                <option value="">-- Select Time Slot --</option>
                                {['09:00 AM', '10:00 AM', '07:00 PM', '09:00 PM'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Weekday Price (Mon-Fri)</label>
                            <input
                                type="number"
                                placeholder="e.g., 500"
                                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                                value={newPriceWeekday}
                                min="0"
                                onChange={(e) => setNewPriceWeekday(parseInt(e.target.value) || 0)}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">Weekend Price (Sat-Sun)</label>
                            <input
                                type="number"
                                placeholder="e.g., 700"
                                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg"
                                value={newPriceWeekend}
                                min="0"
                                onChange={(e) => setNewPriceWeekend(parseInt(e.target.value) || 0)}
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowAddPriceModal(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold"
                            >
                                Save Price Plan
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

interface AdminSidebarProps {
    handleAdminLogout: () => void;
    activeAdminSection: string;
    setActiveAdminSection: React.Dispatch<React.SetStateAction<string>>;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ handleAdminLogout, activeAdminSection, setActiveAdminSection }) => (
    <div className="w-64 bg-black text-gray-300 min-h-screen p-4 flex flex-col border-r border-blue-600">
        <div className="text-xl font-bold text-white mb-6 flex items-center">
            <i className="fas fa-screwdriver-wrench text-blue-600 mr-2"></i> Admin Panel
        </div>
        <nav className="flex-1 space-y-2">
            {[
                { name: "Dashboard", icon: "fa-tachometer-alt" },
                { name: "Users", icon: "fa-users" },
                { name: "Sports", icon: "fa-dumbbell" },
                { name: "Venues", icon: "fa-map-location-dot" },
                { name: "Prices", icon: "fa-tags" }, // NEW ITEM
                { name: "Bookings", icon: "fa-book" },
                { name: "Settings", icon: "fa-cog" },
            ].map((item) => (
                <button
                    key={item.name}
                    onClick={() => setActiveAdminSection(item.name)}
                    className={`w-full text-left flex items-center p-3 rounded-lg transition duration-200 ${
                        activeAdminSection === item.name
                            ? "bg-blue-600 text-white font-semibold"
                            : "hover:bg-gray-900"
                    }`}
                >
                    <i className={`fas ${item.icon} w-5 mr-3`}></i>
                    {item.name}
                </button>
            ))}
        </nav>
        <button
            onClick={handleAdminLogout}
            className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-semibold transition"
        >
            <i className="fas fa-sign-out-alt mr-2"></i> Logout
        </button>
    </div>
);
// --- END MOVED ADMIN UI COMPONENTS ---


const App: React.FC = () => {
  // User States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showBooking, setShowBooking] = useState(false);  
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [finalPrice, setFinalPrice] = useState(0); // NEW: Stores the price fetched from the backend
  const [confirmedBooking, setConfirmedBooking] = useState(false);
  const [userId, setUserId] = useState<number | null>(null); 
  
  // --- NEW STATES FOR AVAILABILITY ---
  const [courtsInVenue, setCourtsInVenue] = useState<Court[]>([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<{ [courtName: string]: string[] }>({});
  // --- END NEW STATES ---

  // Admin States
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [activeAdminSection, setActiveAdminSection] = useState("Dashboard");
  const [adminSports, setAdminSports] = useState<Sport[]>([]);
  const [adminBookings, setAdminBookings] = useState<Booking[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminVenues, setAdminVenues] = useState<Venue[]>([]);
  const [adminCourts, setAdminCourts] = useState<Court[]>([]);
  const [adminPrices, setAdminPrices] = useState<PricePlan[]>([]); // NEW

  // Admin UI States (Sport)
  const [showAddSportModal, setShowAddSportModal] = useState(false);
  const [newSportName, setNewSportName] = useState('');
  const [newSportCourts, setNewSportCourts] = useState(1);
  const newSportIcon = 'fa-dumbbell'; 
  const newSportColor = '#2563EB'; 
  
  // Admin UI States (Venue)
  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  
  // Admin UI States (Court)
  const [showAddCourtModal, setShowAddCourtModal] = useState(false);
  const [newCourtVenueId, setNewCourtVenueId] = useState(0);
  const [newCourtSportName, setNewCourtSportName] = useState('');
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtPricePlanId, setNewCourtPricePlanId] = useState(0);
  
  // Admin UI States (Price Plan)
  const [showAddPriceModal, setShowAddPriceModal] = useState(false); // NEW
  const [newPriceTimeSlot, setNewPriceTimeSlot] = useState(''); // NEW
  const [newPriceWeekday, setNewPriceWeekday] = useState(0); // NEW
  const [newPriceWeekend, setNewPriceWeekend] = useState(0); // NEW


  // User Info States (for form/receipt)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  // Admin Login States
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const receiptRef = useRef<HTMLDivElement>(null);

  // Inject print styles into the DOM
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = printStyles;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  const mockTimeSlots = [
    { time: "09:00 AM" },
    { time: "10:00 AM" },
    { time: "07:00 PM" },
    { time: "09:00 PM" },
  ];

  const userSports = [
    { name: "Cricket", icon: "fa-baseball-bat-ball", color: "#EF4444" },
    { name: "Badminton", icon: "fa-table-tennis-paddle-ball", color: "#a1e90fff" },
    { name: "Basketball", icon: "fa-basketball", color: "#F97316" },
    { name: "Volleyball", icon: "fa-volleyball", color: "#10B981" },
    { name: "Pickleball", icon: "fa-table-tennis-paddle-ball", color: "#6366F1" },
    { name: "Go-Karting", icon: "fa-gauge-high", color: "#F59E0B" },
  ];
  
  const [logoColor, setLogoColor] = useState("#2563EB");

  const printUserList = () => {
        window.print(); 
  };

  // --- ADMIN DATA FETCHING (UPDATED) ---
  const fetchAdminData = useCallback(async () => {
    try {
      // 1. Fetch Sports
      const sportsRes = await fetch(`${API_BASE_URL}/admin/sports`);
      const sportsData: Sport[] = await sportsRes.json();
      setAdminSports(sportsData);

      // 2. Fetch Venues
      const venuesRes = await fetch(`${API_BASE_URL}/admin/venues`);
      const venuesData: Venue[] = await venuesRes.json();
      setAdminVenues(venuesData);
      
      // 3. Fetch Courts
      const courtsRes = await fetch(`${API_BASE_URL}/admin/courts`);
      const courtsData: Court[] = await courtsRes.json();
      setAdminCourts(courtsData);
      
      // 4. Fetch Prices (NEW)
      const pricesRes = await fetch(`${API_BASE_URL}/admin/prices`);
      const pricesData: PricePlan[] = await pricesRes.json();
      setAdminPrices(pricesData);

      // 5. Fetch Bookings
      const bookingsRes = await fetch(`${API_BASE_URL}/bookings/admin`);
      const bookingsData: Booking[] = await bookingsRes.json();
      setAdminBookings(bookingsData);
      
      // 6. Fetch Users
      const usersRes = await fetch(`${API_BASE_URL}/users/all`);
      const usersData: User[] = await usersRes.json();
      setAdminUsers(usersData);
      
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    }
  }, []);

  // --- NEW USER DATA FETCHING: Price Fetcher (UPDATED) ---
  const fetchFinalPrice = useCallback(async (courtName: string, date: string, timeSlot: string) => {
      setFinalPrice(0); // Reset price while fetching
      if (!courtName || !date || !timeSlot) return;
      
      try {
          const url = `${API_BASE_URL}/bookings/price?courtName=${courtName}&date=${date}&timeSlot=${timeSlot}`;
          const res = await fetch(url);
          if (res.ok) {
              const price: number = await res.json();
              setFinalPrice(price);
          } else {
              setFinalPrice(0);
          }
      } catch (error) {
          console.error("API error fetching price:", error);
          setFinalPrice(0);
      }
  }, []);
  
  // --- EXISTING AVAILABILITY FUNCTIONS (Unchanged logic) ---
  const fetchCourtsInVenue = useCallback(async (venueId: number, sportName: string) => {
      try {
          const url = `${API_BASE_URL}/bookings/courts/by-venue-sport?venueId=${venueId}&sportName=${sportName}`;
          const res = await fetch(url);
          if (res.ok) {
              const courts: Court[] = await res.json();
              setCourtsInVenue(courts);
              setBookedTimeSlots({}); 
              setSelectedCourt(null);
          } else {
              console.error("Failed to fetch courts in venue");
              setCourtsInVenue([]);
          }
      } catch (error) {
          console.error("API error fetching courts:", error);
          setCourtsInVenue([]);
      }
  }, []);
  
  const fetchBookedTimeSlotsForCourt = useCallback(async (courtName: string, date: string) => {
      try {
          const url = `${API_BASE_URL}/bookings/booked-slots-by-court?courtName=${courtName}&date=${date}`;
          const res = await fetch(url);
          if (res.ok) {
              const bookedSlots: string[] = await res.json();
              return bookedSlots;
          } else {
              console.error("Failed to fetch booked slots for court:", courtName);
              return [];
          }
      } catch (error) {
          console.error("API error fetching booked slots:", error);
          return [];
      }
  }, []);
  
  const fetchAllAvailability = useCallback(async (courts: Court[], date: string) => {
      if (courts.length === 0 || !date) {
          setBookedTimeSlots({});
          return;
      }
      
      const bookedSlotsMap: { [courtName: string]: string[] } = {};
      
      const fetchPromises = courts.map(async (court) => {
          const bookedSlots = await fetchBookedTimeSlotsForCourt(court.courtName, date);
          bookedSlotsMap[court.courtName] = bookedSlots;
      });
      
      await Promise.all(fetchPromises);
      setBookedTimeSlots(bookedSlotsMap);
  }, [fetchBookedTimeSlotsForCourt]);
  
  // --- END EXISTING AVAILABILITY FUNCTIONS ---

  useEffect(() => {
    if (confirmedBooking && receiptRef.current) {
      receiptRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [confirmedBooking]);
  
  useEffect(() => {
    if (isAdmin) {
        fetchAdminData();
    }
  }, [isAdmin, activeAdminSection, fetchAdminData]);

  // --- BOOKING FLOW USEFFECTS ---
  useEffect(() => {
    if (selectedSport && selectedVenue) {
        fetchCourtsInVenue(selectedVenue.id, selectedSport);
    } else {
        setCourtsInVenue([]);
    }
  }, [selectedSport, selectedVenue, fetchCourtsInVenue]);
  
  useEffect(() => {
      if (courtsInVenue.length > 0 && selectedDate) {
          if(selectedCourt) {
             const slotsForSelectedCourt = bookedTimeSlots[selectedCourt.courtName] || [];
             if(selectedTime && slotsForSelectedCourt.includes(selectedTime)) {
                 setSelectedTime("");
                 setFinalPrice(0);
             }
          }
          fetchAllAvailability(courtsInVenue, selectedDate);
      } else {
          setBookedTimeSlots({});
      }
  }, [courtsInVenue, selectedDate, fetchAllAvailability, selectedCourt, selectedTime]);
  
  // NEW: Fetch price whenever Court, Date, or Time changes
  useEffect(() => {
      if (selectedCourt && selectedDate && selectedTime) {
          fetchFinalPrice(selectedCourt.courtName, selectedDate, selectedTime);
      } else {
          setFinalPrice(0);
      }
  }, [selectedCourt, selectedDate, selectedTime, fetchFinalPrice]);
  // --- END BOOKING FLOW USEFFECTS ---


  // --- ADMIN LOGIC: API INTEGRATION ---
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === "admin@bookmycourt.com" && adminPassword === "admin123") {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setActiveAdminSection("Dashboard");
        setAdminEmail("");
        setAdminPassword("");
        alert("Admin Login Successful!");
    } else {
        alert("Invalid Admin Credentials. Try: admin@bookmycourt.com / admin123");
    }
  };
  
  const handleAdminSignup = (e: React.FormEvent) => {
      e.preventDefault();
      alert("Admin registration successful! Please log in.");
      setShowLogin(true);
  };

  const handleAdminLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setShowLogin(true);
    setLogoColor("#2563EB");
    alert("Admin Logged out successfully!");
  };

  // POST /api/admin/sports (unchanged)
  const handleAddNewSport = async (e: React.FormEvent) => {
      e.preventDefault();
      const newSportData = { 
          name: newSportName, 
          courtCount: newSportCourts, 
          icon: newSportIcon, 
          color: newSportColor 
      };

      try {
          const res = await fetch(`${API_BASE_URL}/admin/sports`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newSportData),
          });
          const msg = await res.text();
          alert(msg);

          if (res.ok) {
              fetchAdminData(); 
              setNewSportName('');
              setNewSportCourts(1);
              setShowAddSportModal(false);
          }
      } catch (error) {
          alert('Failed to connect to API.');
      }
  };

  // POST /api/admin/venues (unchanged)
  const handleAddNewVenue = async (e: React.FormEvent) => {
      e.preventDefault();
      const newVenueData = { 
          name: newVenueName, 
          address: newVenueAddress 
      };

      try {
          const res = await fetch(`${API_BASE_URL}/admin/venues`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newVenueData),
          });
          const msg = await res.text();
          alert(msg);

          if (res.ok) {
              fetchAdminData(); 
              setNewVenueName('');
              setNewVenueAddress('');
              setShowAddVenueModal(false);
          }
      } catch (error) {
          alert('Failed to connect to API.');
      }
  };
  
  // POST /api/admin/courts
  const handleAddNewCourt = async (e: React.FormEvent) => {
      e.preventDefault();

      const newCourtData = { 
          venueId: newCourtVenueId, 
          sportName: newCourtSportName,
          courtName: newCourtName,
          pricePlanId: newCourtPricePlanId,
      };
      
      if(newCourtVenueId === 0 || !newCourtSportName || !newCourtName || newCourtPricePlanId === 0) {
          alert("Please fill all required fields including Price Plan.");
          return;
      }

      try {
          const res = await fetch(`${API_BASE_URL}/admin/courts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newCourtData),
          });
          const msg = await res.text();
          alert(msg);

          if (res.ok) {
              fetchAdminData(); 
              setNewCourtVenueId(0);
              setNewCourtSportName('');
              setNewCourtName('');
              setNewCourtPricePlanId(0);
              setShowAddCourtModal(false);
          }
      } catch (error) {
          alert('Failed to connect to API.');
      }
  };
  
  // POST /api/admin/prices (NEW)
  const handleAddNewPricePlan = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!newPriceTimeSlot || newPriceWeekday <= 0 || newPriceWeekend <= 0) {
          alert("Please ensure Time Slot is selected and prices are greater than 0.");
          return;
      }
      
      const newPriceData = {
          timeSlot: newPriceTimeSlot,
          weekdayPrice: newPriceWeekday,
          weekendPrice: newPriceWeekend,
      };

      try {
          const res = await fetch(`${API_BASE_URL}/admin/prices`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newPriceData),
          });

          if (res.ok) {
              await res.json(); // Consume the JSON response
              alert("Price Plan added successfully!");
              fetchAdminData(); 
              setNewPriceTimeSlot('');
              setNewPriceWeekday(0);
              setNewPriceWeekend(0);
              setShowAddPriceModal(false);
          } else {
              const msg = await res.text();
              alert(`Failed to add Price Plan: ${msg}`);
          }
      } catch (error) {
          alert('Failed to connect to API.');
      }
  };
  
  // DELETE /api/admin/prices/{id} (NEW)
  const handleDeletePricePlan = async (planId: number, planName: string) => {
    if (window.confirm(`Are you sure you want to delete the Price Plan: ${planName}? This action cannot be undone and is only possible if no courts are assigned to it.`)) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/prices/${planId}`, {
                method: 'DELETE',
            });
            const msg = await res.text();
            alert(msg);
            if (res.ok) {
                fetchAdminData(); 
            }
        } catch (error) {
            alert('Failed to connect to API.');
        }
    }
  };


  // Placeholder functions (unchanged)
  const handleAddCourt = async (sport: Sport) => {
    const newCount = sport.courtCount + 1;
    try {
        const res = await fetch(`${API_BASE_URL}/admin/sports/${sport.id}/courts?newCount=${newCount}`, {
            method: 'PUT',
        });
        const msg = await res.text();
        alert(msg);
        if (res.ok) {
            fetchAdminData(); 
        }
    } catch (error) {
        alert('Failed to connect to API.');
    }
  };

  const handleDeleteSport = async (sportId: number, sportName: string) => {
    if (window.confirm(`Are you sure you want to delete the sport: ${sportName}? This action cannot be undone.`)) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/sports/${sportId}`, {
                method: 'DELETE',
            });
            const msg = await res.text();
            alert(msg);
            if (res.ok) {
                fetchAdminData(); 
            }
        } catch (error) {
            alert('Failed to connect to API.');
        }
    }
  };


  // --- USER LOGIC: API INTEGRATION ---
  
  // POST /api/users/signup (unchanged)
  const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      const userData = { name, email, mobile, password };
      try {
          const res = await fetch(`${API_BASE_URL}/users/signup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData),
          });
          const msg = await res.text();
          alert(msg);
          if (res.ok) {
              setShowLogin(true);
          }
      } catch (error) {
          alert('Failed to connect to API.');
      }
  };

  // POST /api/users/login (unchanged)
  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      const userData = { email, password };
      try {
          const res = await fetch(`${API_BASE_URL}/users/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData),
          });
          const msg = await res.text();
          alert(msg);
          
          if (res.ok) {
              const userIdMatch = msg.match(/(\d+)$/); 
              if (userIdMatch) {
                  setUserId(parseInt(userIdMatch[1]));
              }

              setIsLoggedIn(true);
              setIsAdmin(false);
              setShowAdminLogin(false);
              
              // Fetch venues for booking flow
              const venuesRes = await fetch(`${API_BASE_URL}/admin/venues`);
              const venuesData: Venue[] = await venuesRes.json();
              setAdminVenues(venuesData);
              
              // Fetch price plans for time slot price display
              const pricesRes = await fetch(`${API_BASE_URL}/admin/prices`);
              const pricesData: PricePlan[] = await pricesRes.json();
              setAdminPrices(pricesData);
          }
      } catch (error) {
          alert('Failed to connect to API.');
      }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLogin(true);
    setShowBooking(false);
    setSelectedSport("");
    setSelectedVenue(null);
    setSelectedCourt(null);
    setSelectedTime("");
    setFinalPrice(0);
    setConfirmedBooking(false);
    setLogoColor("#2563EB");
    setUserId(null); 
    setCourtsInVenue([]);
    setBookedTimeSlots({});
    alert("Logged out successfully!");
  };

  const handleBackToSportSelection = () => {
    setShowBooking(false);
    setSelectedSport("");
    setSelectedDate("");
    setSelectedVenue(null);
    setSelectedCourt(null);
    setSelectedTime("");
    setFinalPrice(0);
    setConfirmedBooking(false);
    setLogoColor("#2563EB"); 
    setCourtsInVenue([]);
    setBookedTimeSlots({});
  };

  const handleSportSelect = (sportName: string) => {
    const sport = userSports.find(s => s.name === sportName);
    if (sport) {
        setSelectedSport(sportName);
        setLogoColor(sport.color); 
        setShowBooking(true);
    }
  };

  // --- NEW HANDLERS FOR DATE/VENUE/COURT ---
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedTime(""); 
  };
  
  const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const venueId = parseInt(e.target.value);
    const venue = adminVenues.find(v => v.id === venueId);
    setSelectedVenue(venue || null);
    setSelectedCourt(null);
    setSelectedTime("");
  };
  
  const handleCourtSelect = (court: Court) => {
      setSelectedCourt(court);
      setSelectedTime("");
  };
  
  const handleTimeSlotSelect = (timeSlot: string) => {
      setSelectedTime(timeSlot);
  };
  // --- END NEW HANDLERS ---

  // POST /api/bookings/{userId}
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenue || !selectedDate || !selectedTime || !selectedCourt || userId === null || finalPrice <= 0) {
      alert("Please ensure all fields are selected and price is determined!");
      return;
    }
    
    // Final price is validated here (finalPrice state should be > 0)
    
    const bookingData = {
        sportName: selectedSport,
        venue: selectedVenue.name,
        courtName: selectedCourt.courtName,
        date: selectedDate,
        timeSlot: selectedTime,
        price: finalPrice, // Use the price fetched from the backend
    };
    
    try {
        const res = await fetch(`${API_BASE_URL}/bookings/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
        });
        const msg = await res.text();
        alert(msg);

        if (res.ok) {
             setConfirmedBooking(true);
             fetchAllAvailability(courtsInVenue, selectedDate);
        }
    } catch (error) {
        alert('Failed to connect to API for booking.');
    }
  };

  const printReceipt = () => {
    window.print();
  };


  // --- MAIN RETURN STRUCTURE ---

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header (Admin and User) */}
      <header className="bg-black shadow-md fixed w-full z-50 print-hide">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <i className="fas fa-dumbbell text-3xl mr-2" style={{ color: logoColor }}></i>
            <span className="text-xl font-bold text-white">BookMyCourt</span>
          </div>
          <div className="flex items-center space-x-8">
            <a href="#home" className="text-gray-300 hover:text-blue-400">Home</a>
            <a href="#about" className="text-gray-300 hover:text-blue-400">About</a>
            <a href="#contact" className="text-gray-300 hover:text-blue-400">Contact</a>
            
            {!isLoggedIn && (
                <>
                    <button
                        onClick={() => { setShowLogin(true); setShowAdminLogin(false); }}
                        className="text-gray-300 hover:text-blue-400 whitespace-nowrap"
                    >
                        User Login
                    </button>
                    <button
                        onClick={() => { setShowLogin(true); setShowAdminLogin(true); }}
                        className="rounded-lg bg-red-600 text-white px-4 py-2 hover:bg-red-700 whitespace-nowrap"
                    >
                        Admin Login
                    </button>
                </>
            )}
            
            {isLoggedIn && !isAdmin && (
              <button onClick={handleLogout} className="rounded-lg bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 whitespace-nowrap">
                Logout
              </button>
            )}
            {isLoggedIn && isAdmin && (
              <button onClick={handleAdminLogout} className="rounded-lg bg-red-600 text-white px-6 py-2 hover:bg-red-700 whitespace-nowrap">
                Admin Logout
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      {isLoggedIn && isAdmin ? (
          // --- ADMIN SITE RENDER ---
          <div className="flex pt-16">
              <AdminSidebar handleAdminLogout={handleAdminLogout} activeAdminSection={activeAdminSection} setActiveAdminSection={setActiveAdminSection} />
              <AdminDashboard 
                  adminUsers={adminUsers} 
                  adminSports={adminSports} 
                  adminBookings={adminBookings} 
                  adminVenues={adminVenues} 
                  adminCourts={adminCourts} 
                  adminPrices={adminPrices} // NEW PROP
                  activeAdminSection={activeAdminSection} 
                  handleAddCourt={handleAddCourt} 
                  handleDeleteSport={handleDeleteSport} 
                  printUserList={printUserList} 
                  // Sport Handlers
                  setShowAddSportModal={setShowAddSportModal}
                  showAddSportModal={showAddSportModal}
                  newSportName={newSportName}
                  setNewSportName={setNewSportName}
                  newSportCourts={newSportCourts}
                  setNewSportCourts={setNewSportCourts}
                  handleAddNewSport={handleAddNewSport}
                  // Venue/Court Handlers
                  setShowAddVenueModal={setShowAddVenueModal}
                  showAddVenueModal={showAddVenueModal}
                  newVenueName={newVenueName}
                  setNewVenueName={setNewVenueName}
                  newVenueAddress={newVenueAddress}
                  setNewVenueAddress={setNewVenueAddress}
                  handleAddNewVenue={handleAddNewVenue}
                  setShowAddCourtModal={setShowAddCourtModal}
                  showAddCourtModal={showAddCourtModal}
                  newCourtVenueId={newCourtVenueId}
                  setNewCourtVenueId={setNewCourtVenueId}
                  newCourtSportName={newCourtSportName}
                  setNewCourtSportName={setNewCourtSportName}
                  newCourtName={newCourtName}
                  setNewCourtName={setNewCourtName}
                  newCourtPricePlanId={newCourtPricePlanId}
                  setNewCourtPricePlanId={setNewCourtPricePlanId}
                  handleAddNewCourt={handleAddNewCourt}
                  // Price Handlers
                  setShowAddPriceModal={setShowAddPriceModal} // NEW
                  showAddPriceModal={showAddPriceModal} // NEW
                  newPriceTimeSlot={newPriceTimeSlot} // NEW
                  setNewPriceTimeSlot={setNewPriceTimeSlot} // NEW
                  newPriceWeekday={newPriceWeekday} // NEW
                  setNewPriceWeekday={setNewPriceWeekday} // NEW
                  newPriceWeekend={newPriceWeekend} // NEW
                  setNewPriceWeekend={setNewPriceWeekend} // NEW
                  handleAddNewPricePlan={handleAddNewPricePlan} // NEW
                  handleDeletePricePlan={handleDeletePricePlan} // NEW
              />
          </div>
      ) : (
          // --- USER SITE RENDER (Login/Signup/Booking) ---
          <main className="pt-24">
              {/* Conditional rendering for User/Admin Login/Signup pages / Sport Selection / Booking */}
              {!isLoggedIn && showAdminLogin ? (
                  <AdminLoginSignup 
                      showLogin={showLogin}
                      adminName={adminName}
                      adminEmail={adminEmail}
                      adminPassword={adminPassword}
                      handleAdminLogin={handleAdminLogin}
                      handleAdminSignup={handleAdminSignup}
                      setAdminName={setAdminName}
                      setAdminEmail={setAdminEmail}
                      setAdminPassword={setAdminPassword}
                      setShowLogin={setShowLogin}
                  />
              ) : !isLoggedIn && showLogin ? (
                  <div className="container mx-auto px-6 py-12">
                      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                          <h2 className="text-2xl font-bold text-center mb-8">Welcome Back</h2>
                          <form onSubmit={handleLogin} className="space-y-6">
                            <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <input type="password" placeholder="Password" className="w-full px-4 py-2 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Login</button>
                            <p className="text-center text-gray-600">Don’t have an account? <button type="button" onClick={() => setShowLogin(false)} className="text-blue-600 underline">Sign up</button></p>
                          </form>
                      </div>
                  </div>
              ) : !isLoggedIn ? (
                  <div className="container mx-auto px-6 py-12">
                      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                          <h2 className="text-2xl font-bold text-center mb-8">Create Account</h2>
                          <form onSubmit={handleSignup} className="space-y-6">
                            <input type="text" placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg" value={name} onChange={(e) => setName(e.target.value)} required />
                            <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <input type="tel" placeholder="Mobile Number" className="w-full px-4 py-2 border rounded-lg" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                            <input type="password" placeholder="Password" className="w-full px-4 py-2 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Sign Up</button>
                          </form>
                      </div>
                  </div>
              ) : showBooking ? (
                  <div className="container mx-auto px-6 py-12">
                      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                          <button onClick={handleBackToSportSelection} className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
                              <i className="fas fa-arrow-left mr-2"></i> Back to Sport Selection
                          </button>
                          <h2 className="text-2xl font-bold mb-8">Book {selectedSport}</h2>
                          <form onSubmit={handleBooking} className="space-y-6">
                              <div><label className="block text-gray-700 mb-2">Select Venue</label>
                              <select 
                                  className="w-full border rounded-lg px-4 py-2" 
                                  value={selectedVenue?.id || ""} 
                                  onChange={handleVenueChange}
                                  required
                              >
                                <option value="">Choose Venue</option>
                                {adminVenues.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
                              </select></div>
                              
                              <div><label className="block text-gray-700 mb-2">Select Date</label>
                              <input 
                                  type="date" 
                                  className="w-full border rounded-lg px-4 py-2" 
                                  value={selectedDate} 
                                  min={new Date().toISOString().split("T")[0]} 
                                  onChange={handleDateChange}
                                  required 
                              /></div>
                              
                              {/* --- NEW COURT SELECTION SECTION --- */}
                              {selectedVenue && courtsInVenue.length > 0 && (
                                  <div>
                                      <label className="block text-gray-700 mb-2">Select Court</label>
                                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                          {courtsInVenue.map((court) => {
                                              const isSelected = selectedCourt?.id === court.id;
                                              
                                              let buttonClasses = 'p-3 border rounded-lg flex flex-col items-center transition duration-200 text-sm cursor-pointer';

                                              if (isSelected) {
                                                  buttonClasses += ' bg-blue-600 text-white font-semibold border-blue-600';
                                              } else {
                                                  buttonClasses += ' bg-gray-100 text-gray-700 hover:bg-blue-100';
                                              }

                                              return (
                                                  <button
                                                      key={court.id}
                                                      type="button"
                                                      onClick={() => handleCourtSelect(court)}
                                                      className={buttonClasses}
                                                  >
                                                      <i className="fas fa-tennis-ball mb-1"></i>
                                                      <span className="text-center font-medium">{court.courtName}</span>
                                                      <span className="text-xs mt-1 text-gray-500">Plan ID: {court.pricePlanId}</span>
                                                  </button>
                                              );
                                          })}
                                      </div>
                                  </div>
                              )}
                              
                              {selectedVenue && courtsInVenue.length === 0 && (
                                  <p className="text-red-500 font-semibold">No courts available for {selectedSport} at {selectedVenue.name}.</p>
                              )}
                              {/* --- END NEW COURT SELECTION SECTION --- */}

                              {/* --- UPDATED TIME SLOT RENDER WITH COURT AVAILABILITY LOGIC --- */}
                              {selectedCourt && selectedDate && (
                                  <div>
                                      <label className="block text-gray-700 mb-2">Select Time Slot for {selectedCourt.courtName}</label>
                                      <div className="grid grid-cols-3 gap-4">
                                          {mockTimeSlots.map((slot) => {
                                              const isBooked = bookedTimeSlots[selectedCourt.courtName]?.includes(slot.time) || false;
                                              const isSelected = selectedTime === slot.time;
                                              const plan = adminPrices.find(p => p.timeSlot === slot.time);
                                              
                                              let buttonClasses = 'p-2 border rounded-lg flex flex-col items-center transition duration-200';

                                              if (isBooked) {
                                                  buttonClasses += ' bg-red-400 text-white cursor-not-allowed';
                                              } else if (isSelected) {
                                                  buttonClasses += ' bg-blue-600 text-white font-semibold';
                                              } else {
                                                  buttonClasses += ' bg-green-500 text-white hover:bg-green-600';
                                              }
                                              
                                              const priceDisplay = plan ? `Plan ₹${plan.weekdayPrice}` : 'NO PLAN';

                                              return (
                                                  <button
                                                      key={slot.time}
                                                      type="button"
                                                      disabled={isBooked}
                                                      onClick={() => {
                                                          if (!isBooked) {
                                                              handleTimeSlotSelect(slot.time);
                                                          }
                                                      }}
                                                      className={buttonClasses}
                                                  >
                                                      <span>{slot.time}</span>
                                                      <span className="text-sm mt-1">{isBooked ? 'BOOKED' : priceDisplay}</span>
                                                  </button>
                                              );
                                          })}
                                      </div>
                                  </div>
                              )}
                              
                              {/* --- FINAL PRICE DISPLAY --- */}
                              {selectedTime && (
                                  <div className="mt-6 text-xl font-bold text-right text-gray-800">
                                      Final Price: <span className="text-blue-600">₹{finalPrice}</span>
                                  </div>
                              )}
                              {/* --- END FINAL PRICE DISPLAY --- */}

                              <div className="flex justify-end space-x-4">
                                <button 
                                    type="submit" 
                                    disabled={!selectedCourt || !selectedTime || finalPrice <= 0}
                                    className={`text-white px-6 py-2 rounded-lg ${!selectedCourt || !selectedTime || finalPrice <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    Confirm Booking
                                </button>
                              </div>
                          </form>
                          {confirmedBooking && selectedCourt && selectedVenue && (
                            <div 
                                ref={receiptRef} 
                                className="mt-10 bg-gray-50 p-6 rounded-lg shadow-inner border-t-4 border-blue-600">
                              <h3 className="text-2xl font-bold text-center text-green-600 mb-4">✅ Booking Confirmed</h3>
                              <div className="space-y-2 text-gray-700">
                                <p><strong>Name:</strong> {name}</p><p><strong>Email:</strong> {email}</p><p><strong>Mobile:</strong> {mobile}</p><p><strong>Sport:</strong> {selectedSport}</p>
                                <p><strong>Venue:</strong> {selectedVenue.name}</p>
                                <p><strong>Court:</strong> {selectedCourt.courtName}</p>
                                <p><strong>Date:</strong> {selectedDate}</p><p><strong>Time:</strong> {selectedTime}</p><p><strong>Price:</strong> ₹{finalPrice}</p> {/* Use finalPrice */}
                                <a href="#" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">📍 View on Google Maps (Mock)</a>
                              </div>
                              <button onClick={printReceipt} className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Print Receipt</button>
                            </div>
                          )}
                      </div>
                  </div>
              ) : (
                  <div className="container mx-auto px-6 py-12">
                      <h2 className="text-2xl font-bold mb-8 text-center">Select Sport</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userSports.map((sport) => (<div key={sport.name} onClick={() => handleSportSelect(sport.name)} className="bg-white p-8 rounded-lg shadow-lg text-center hover:scale-105 transition transform cursor-pointer">
                            <i className={`fas ${sport.icon} text-4xl mb-4`} style={{ color: sport.color }}></i>
                            <h3 className="font-semibold text-lg">{sport.name}</h3>
                          </div>))}
                      </div>
                  </div>
              )}
          </main>
      )}

      {/* About and Contact Sections: Render only if NOT in Admin View (unchanged) */}
      {!isAdmin && (
        <>
          {/* About Section */}
          <section id="about" className="py-16 bg-white">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-center mb-12">
                About BookMyCourt
              </h2>
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-gray-600 mb-8">
                  BookMyCourt is your all-in-one platform for booking sports
                  facilities. Whether you play casually with friends or compete
                  regularly, we make it easy to reserve courts and fields for your
                  favorite sports.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg shadow-md p-6">
                    <i className="fas fa-clock text-3xl text-blue-600 mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">Flexible Timing</h3>
                    <p className="text-gray-600">
                      Book your preferred slot anytime.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg shadow-md p-6">
                    <i className="fas fa-shield text-3xl text-blue-600 mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
                    <p className="text-gray-600">
                      Reliable and simple reservation system.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg shadow-md p-6">
                    <i className="fas fa-star text-3xl text-blue-600 mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">
                      Top Quality Venues
                    </h3>
                    <p className="text-gray-600">
                      Play at the city’s best-maintained courts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="bg-gray-100 py-16">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <i className="fas fa-envelope text-3xl text-blue-600 mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">Email</h3>
                  <p>bookmycourt@support.com</p>
                </div>
                <div className="text-center">
                  <i className="fas fa-phone text-3xl text-blue-600 mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">Phone</h3>
                  <p>9664755223</p>
                </div>
                <div className="text-center">
                  <i className="fas fa-location-dot text-3xl text-blue-600 mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">Location</h3>
                  <p>Ahmedabad Gujarat</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default App;