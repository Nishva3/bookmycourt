package com.example.bookmycourt;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// --- 1. JPA Entities (Database Tables) ---

// User Entity (Existing)
@Entity
@Table(name = "users")
class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String mobile;
    private String password;

    public User() {}

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getMobile() { return mobile; }
    public String getPassword() { return password; }

    // Setters
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public void setPassword(String password) { this.password = password; }
}

// Sport Entity (Existing)
@Entity
@Table(name = "sports")
class Sport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private int courtCount; 
    private String icon; 
    private String color; 

    public Sport() {}

    // Getters and Setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public int getCourtCount() { return courtCount; }
    
    public String getIcon() { return icon; } 
    public String getColor() { return color; } 
    
    public void setName(String name) { this.name = name; }
    public void setCourtCount(int courtCount) { this.courtCount = courtCount; }
    public void setIcon(String icon) { this.icon = icon; }
    public void setColor(String color) { this.color = color; }
}

// NEW ENTITY: PricePlan (For Dynamic Pricing)
@Entity
@Table(name = "price_plans")
class PricePlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name; // e.g., "Badminton 09:00 AM Weekday"
    private String timeSlot; // e.g., "09:00 AM"
    private int weekdayPrice;
    private int weekendPrice;

    public PricePlan() {}

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getTimeSlot() { return timeSlot; }
    public int getWeekdayPrice() { return weekdayPrice; }
    public int getWeekendPrice() { return weekendPrice; }

    // Setters
    public void setName(String name) { this.name = name; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    public void setWeekdayPrice(int weekdayPrice) { this.weekdayPrice = weekdayPrice; }
    public void setWeekendPrice(int weekendPrice) { this.weekendPrice = weekendPrice; }
}

// NEW ENTITY: Venue (Physical Location)
@Entity
@Table(name = "venues")
class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name; // e.g., "Sports Arena - Satellite"
    private String address;
    private String city = "Ahmedabad"; // Default for now

    public Venue() {}

    // Getters and Setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public String getCity() { return city; }

    public void setName(String name) { this.name = name; }
    public void setAddress(String address) { this.address = address; }
    public void setCity(String city) { this.city = city; }
}

// NEW ENTITY: Court (Bookable Asset)
@Entity
@Table(name = "courts")
class Court {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long venueId; // Link to Venue
    private String sportName; // Link to Sport
    private String courtName; // e.g., "Badminton Court 1"
    private Long pricePlanId; // Link to PricePlan for default pricing

    public Court() {}

    // Getters
    public Long getId() { return id; }
    public Long getVenueId() { return venueId; }
    public String getSportName() { return sportName; }
    public String getCourtName() { return courtName; }
    public Long getPricePlanId() { return pricePlanId; }

    // Setters
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public void setSportName(String sportName) { this.sportName = sportName; }
    public void setCourtName(String courtName) { this.courtName = courtName; }
    public void setPricePlanId(Long pricePlanId) { this.pricePlanId = pricePlanId; }
}


// Booking Entity (UPDATED to use CourtName)
@Entity
@Table(name = "bookings")
class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId; // Link to User
    private String userName;
    private String sportName;
    private String venue;
    private String courtName; // NEW FIELD: Which specific court was booked
    private String date;
    private String timeSlot;
    private int price;
    private String status = "Confirmed"; // Default status

    public Booking() {}

    // Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getSportName() { return sportName; }
    public String getVenue() { return venue; }
    public String getCourtName() { return courtName; } // NEW GETTER
    public String getDate() { return date; } 
    public String getTimeSlot() { return timeSlot; } 
    public int getPrice() { return price; } 
    public String getStatus() { return status; }

    // Setters
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUserName(String userName) { this.userName = userName; }
    public void setSportName(String sportName) { this.sportName = sportName; }
    public void setVenue(String venue) { this.venue = venue; }
    public void setCourtName(String courtName) { this.courtName = courtName; } // NEW SETTER
    public void setDate(String date) { this.date = date; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    public void setPrice(int price) { this.price = price; }
    public void setStatus(String status) { this.status = status; }
}

// --- 2. Data Transfer Objects (DTOs) ---

// UserRequest (Existing)
class UserRequest {
    private String name;
    private String email;
    private String mobile;
    private String password;

    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getMobile() { return mobile; }
    public String getPassword() { return password; }
}

// SportRequest (Existing)
class SportRequest {
    private String name;
    private int courtCount;
    private String icon;
    private String color;

    public String getName() { return name; }
    public int getCourtCount() { return courtCount; }
    public String getIcon() { return icon; }
    public String getColor() { return color; }
}

// NEW DTO: VenueRequest
class VenueRequest {
    private String name;
    private String address;
    public String getName() { return name; }
    public String getAddress() { return address; }
}

// NEW DTO: CourtRequest
class CourtRequest {
    private Long venueId;
    private String sportName;
    private String courtName;
    private Long pricePlanId;
    public Long getVenueId() { return venueId; }
    public String getSportName() { return sportName; }
    public String getCourtName() { return courtName; }
    public Long getPricePlanId() { return pricePlanId; }
}

// NEW DTO: PricePlanRequest
class PricePlanRequest {
    private String timeSlot;
    private int weekdayPrice;
    private int weekendPrice;
    
    public String getTimeSlot() { return timeSlot; }
    public int getWeekdayPrice() { return weekdayPrice; }
    public int getWeekendPrice() { return weekendPrice; }
}

// BookingRequest (UPDATED to include courtName)
class BookingRequest {
    // Frontend sends this data upon confirmation
    private String sportName;
    private String venue;
    private String courtName; // NEW FIELD
    private String date;
    private String timeSlot;
    private int price;

    public String getSportName() { return sportName; }
    public String getVenue() { return venue; }
    public String getCourtName() { return courtName; } // NEW GETTER
    public String getDate() { return date; }
    public String getTimeSlot() { return timeSlot; }
    public int getPrice() { return price; }
}


// --- 3. Repositories (Database Access Layer) ---

// User Repository (Existing)
@Repository
interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

// Sport Repository (Existing)
@Repository
interface SportRepository extends JpaRepository<Sport, Long> {
    Optional<Sport> findByName(String name);
}

// NEW Repository: PricePlan
@Repository
interface PricePlanRepository extends JpaRepository<PricePlan, Long> {}

// NEW Repository: Venue
@Repository
interface VenueRepository extends JpaRepository<Venue, Long> {
    Optional<Venue> findByName(String name);
}

// NEW Repository: Court
@Repository
interface CourtRepository extends JpaRepository<Court, Long> {
    // Find all courts for a specific venue and sport
    List<Court> findByVenueIdAndSportName(Long venueId, String sportName);
    Optional<Court> findByCourtName(String courtName);
}


// Booking Repository (UPDATED)
@Repository
interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // 1. For the pre-booking check (UPDATED to use CourtName)
    boolean existsByCourtNameAndDateAndTimeSlot(String courtName, String date, String timeSlot);

    // 2. For the availability display (UPDATED to use CourtName)
    List<Booking> findByCourtNameAndDate(String courtName, String date);
}


// --- 4. REST Controllers (API Endpoints) ---

// UserAuthController (Existing, no changes)
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
class UserAuthController {

    private final UserRepository userRepository;

    public UserAuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody UserRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Error: Email already registered.");
        }

        User newUser = new User();
        newUser.setName(req.getName());
        newUser.setEmail(req.getEmail());
        newUser.setMobile(req.getMobile());
        newUser.setPassword(req.getPassword()); 

        userRepository.save(newUser);
        return ResponseEntity.ok("User Registered Successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UserRequest req) {
        Optional<User> userOpt = userRepository.findByEmail(req.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Error: User not found.");
        }

        User user = userOpt.get();
        if (!user.getPassword().equals(req.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid password.");
        }

        return ResponseEntity.ok("Login successful: " + user.getId());
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}

// AdminSportsController (Existing, no changes)
@RestController
@RequestMapping("/api/admin/sports")
@CrossOrigin(origins = "http://localhost:3000")
class AdminSportsController {

    private final SportRepository sportRepository;

    public AdminSportsController(SportRepository sportRepository) {
        this.sportRepository = sportRepository;
    }

    @GetMapping
    public List<Sport> getAllSports() {
        return sportRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<String> addSport(@RequestBody SportRequest req) {
        if (sportRepository.findByName(req.getName()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Error: Sport already exists.");
        }

        Sport newSport = new Sport();
        newSport.setName(req.getName());
        newSport.setCourtCount(req.getCourtCount());
        newSport.setIcon(req.getIcon() != null ? req.getIcon() : "fa-dumbbell");
        newSport.setColor(req.getColor() != null ? req.getColor() : "#2563EB");
        sportRepository.save(newSport);

        return ResponseEntity.ok("Sport added successfully.");
    }

    @PutMapping("/{id}/courts")
    @Transactional
    public ResponseEntity<String> updateCourtCount(@PathVariable Long id, @RequestParam int newCount) {
        Optional<Sport> sportOpt = sportRepository.findById(id);

        if (sportOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sport not found.");
        }
        
        Sport sport = sportOpt.get();
        if (newCount < 0) {
            return ResponseEntity.badRequest().body("Court count cannot be negative.");
        }
        sport.setCourtCount(newCount);
        sportRepository.save(sport);

        return ResponseEntity.ok("Court count updated successfully.");
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSport(@PathVariable Long id) {
        if (sportRepository.existsById(id)) {
            sportRepository.deleteById(id);
            return ResponseEntity.ok("Sport deleted successfully.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sport not found.");
    }
}

// NEW CONTROLLER: AdminPricePlanController
@RestController
@RequestMapping("/api/admin/prices")
@CrossOrigin(origins = "http://localhost:3000")
class AdminPricePlanController {
    private final PricePlanRepository pricePlanRepository;
    private final CourtRepository courtRepository;

    public AdminPricePlanController(PricePlanRepository pricePlanRepository, CourtRepository courtRepository) {
        this.pricePlanRepository = pricePlanRepository;
        this.courtRepository = courtRepository;
    }
    
    // GET /api/admin/prices - Get all price plans
    @GetMapping
    public List<PricePlan> getAllPricePlans() {
        return pricePlanRepository.findAll();
    }
    
    // POST /api/admin/prices - Create a new price plan
    @PostMapping
    public ResponseEntity<PricePlan> createPricePlan(@RequestBody PricePlanRequest req) {
        PricePlan newPlan = new PricePlan();
        // Dynamic Name for better visualization
        newPlan.setName("Standard - " + req.getTimeSlot()); 
        newPlan.setTimeSlot(req.getTimeSlot());
        newPlan.setWeekdayPrice(req.getWeekdayPrice());
        newPlan.setWeekendPrice(req.getWeekendPrice());
        
        PricePlan savedPlan = pricePlanRepository.save(newPlan);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlan);
    }
    
    // GET /api/admin/prices/{id} - Get single price plan
    @GetMapping("/{id}")
    public ResponseEntity<PricePlan> getPricePlanById(@PathVariable Long id) {
        Optional<PricePlan> planOpt = pricePlanRepository.findById(id);
        return planOpt.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // DELETE /api/admin/prices/{id} - Delete a price plan
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePricePlan(@PathVariable Long id) {
        if (!pricePlanRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Price Plan not found.");
        }

        // Check if any court is currently using this plan
        long count = courtRepository.findAll().stream()
                                    .filter(court -> court.getPricePlanId().equals(id))
                                    .count();

        if (count > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Cannot delete: Price Plan is currently assigned to " + count + " court(s).");
        }
        
        pricePlanRepository.deleteById(id);
        return ResponseEntity.ok("Price Plan deleted successfully.");
    }
}


// AdminVenueController (Existing, no changes)
@RestController
@RequestMapping("/api/admin/venues")
@CrossOrigin(origins = "http://localhost:3000")
class AdminVenueController {
    
    private final VenueRepository venueRepository;

    public AdminVenueController(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }
    
    // GET /api/admin/venues - Get all venues
    @GetMapping
    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }
    
    // POST /api/admin/venues - Add a new venue
    @PostMapping
    public ResponseEntity<String> addVenue(@RequestBody VenueRequest req) {
        if (venueRepository.findByName(req.getName()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Error: Venue with this name already exists.");
        }
        
        Venue newVenue = new Venue();
        newVenue.setName(req.getName());
        newVenue.setAddress(req.getAddress());
        venueRepository.save(newVenue);
        
        return ResponseEntity.ok("Venue added successfully!");
    }
}

// AdminCourtController (Simplified CRUD for Courts, now depends on PricePlans)
@RestController
@RequestMapping("/api/admin/courts")
@CrossOrigin(origins = "http://localhost:3000")
class AdminCourtController {
    
    private final CourtRepository courtRepository;
    private final VenueRepository venueRepository;
    private final PricePlanRepository pricePlanRepository;
    
    public AdminCourtController(CourtRepository courtRepository, VenueRepository venueRepository, PricePlanRepository pricePlanRepository) {
        this.courtRepository = courtRepository;
        this.venueRepository = venueRepository;
        this.pricePlanRepository = pricePlanRepository;
    }
    
    // GET /api/admin/courts - Get all courts
    @GetMapping
    public List<Court> getAllCourts() {
        return courtRepository.findAll();
    }

    // POST /api/admin/courts - Add a new court (Added PricePlan check)
    @PostMapping
    public ResponseEntity<String> addCourt(@RequestBody CourtRequest req) {
        if (venueRepository.findById(req.getVenueId()).isEmpty()) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Venue ID.");
        }
        if (pricePlanRepository.findById(req.getPricePlanId()).isEmpty()) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid PricePlan ID.");
        }

        Court newCourt = new Court();
        newCourt.setVenueId(req.getVenueId());
        newCourt.setSportName(req.getSportName());
        newCourt.setCourtName(req.getCourtName());
        newCourt.setPricePlanId(req.getPricePlanId());
        
        courtRepository.save(newCourt);
        
        return ResponseEntity.ok("Court added successfully!");
    }
}


// BookingController (UPDATED to fetch price dynamically based on Court's PricePlan)
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
class BookingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CourtRepository courtRepository;
    private final PricePlanRepository pricePlanRepository; // NEW

    public BookingController(BookingRepository bookingRepository, UserRepository userRepository, CourtRepository courtRepository, PricePlanRepository pricePlanRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.courtRepository = courtRepository;
        this.pricePlanRepository = pricePlanRepository;
    }

    // NEW ENDPOINT: /api/bookings/price?courtName=X&date=Y&timeSlot=Z
    // Calculates the final price for a chosen slot and court.
    @GetMapping("/price")
    public ResponseEntity<Integer> getFinalPrice(
        @RequestParam String courtName,
        @RequestParam String date,
        @RequestParam String timeSlot) {
        
        Optional<Court> courtOpt = courtRepository.findByCourtName(courtName);
        if (courtOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(0);
        }

        Optional<PricePlan> planOpt = pricePlanRepository.findById(courtOpt.get().getPricePlanId());
        if (planOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(0);
        }
        
        PricePlan plan = planOpt.get();

        // 1. Check if the time slot matches the plan slot (optional validation)
        if (!plan.getTimeSlot().equals(timeSlot)) {
            // This scenario implies a data mismatch, return default/error price
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(0);
        }

        // 2. Determine if it's a weekend (Sat/Sun are 0 and 6 in Java/JS)
        try {
            // Simple string date parsing is risky, but matches frontend logic for now
            // In production, use LocalDate.parse
            java.time.DayOfWeek day = java.time.LocalDate.parse(date).getDayOfWeek();
            boolean isWeekend = day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY;
            
            int finalPrice = isWeekend ? plan.getWeekendPrice() : plan.getWeekdayPrice();
            
            return ResponseEntity.ok(finalPrice);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(0); // Invalid date format
        }
    }


    // POST /api/bookings/{userId} - User Booking: Create a new booking
    @PostMapping("/{userId}")
    public ResponseEntity<String> createBooking(@PathVariable Long userId, @RequestBody BookingRequest req) {
        
        // 1. AVAILABILITY CHECK:
        if (bookingRepository.existsByCourtNameAndDateAndTimeSlot(
                req.getCourtName(), 
                req.getDate(), 
                req.getTimeSlot())) {
            
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Error: Court '" + req.getCourtName() + "' at this slot is already booked.");
        }
        
        // 2. User validation
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User ID is invalid.");
        }
        
        User user = userOpt.get();
        
        // 3. Create Booking
        Booking newBooking = new Booking();
        newBooking.setUserId(userId);
        newBooking.setUserName(user.getName());
        newBooking.setSportName(req.getSportName());
        newBooking.setVenue(req.getVenue());
        newBooking.setCourtName(req.getCourtName()); 
        newBooking.setDate(req.getDate());
        newBooking.setTimeSlot(req.getTimeSlot());
        newBooking.setPrice(req.getPrice()); // Uses price calculated and sent by frontend

        bookingRepository.save(newBooking);
        return ResponseEntity.ok("Booking confirmed successfully for court: " + req.getCourtName() + "!");
    }
    
    // GET /api/courts/by-venue-sport?venueId=X&sportName=Y
    @GetMapping("/courts/by-venue-sport")
    public List<Court> getCourtsByVenueAndSport(
        @RequestParam Long venueId,
        @RequestParam String sportName) {
        
        return courtRepository.findByVenueIdAndSportName(venueId, sportName);
    }

    // GET /api/bookings/booked-slots-by-court?courtName=X&date=Z
    @GetMapping("/booked-slots-by-court")
    public List<String> getBookedTimeSlotsByCourt(
        @RequestParam String courtName,
        @RequestParam String date) {
        
        List<Booking> bookedSlots = bookingRepository.findByCourtNameAndDate(courtName, date);
        
        return bookedSlots.stream()
                .map(Booking::getTimeSlot)
                .collect(Collectors.toList());
    }

    // GET /api/bookings/admin - Admin Dashboard: Get all bookings
    @GetMapping("/admin")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

   @PutMapping("/{id}/status")
    public ResponseEntity<String> updateBookingStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);

        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found.");
        }

        Booking booking = bookingOpt.get();
        booking.setStatus(status); 
        
        bookingRepository.save(booking);

        return ResponseEntity.ok("Booking status updated to " + status);
    }
}


// --- 5. Main Spring Boot Application ---
@SpringBootApplication
public class UserAuthApp 
{
    public static void main(String[] args) 
    {
        SpringApplication.run(UserAuthApp.class, args);
    }
    
    // --- 6. Application Initialization ---

    @Bean
    public CommandLineRunner initDatabase(SportRepository sportRepository, PricePlanRepository pricePlanRepository, VenueRepository venueRepository, CourtRepository courtRepository) {
        return args -> {
            // 1. Initialize Default Sports
            if (sportRepository.count() == 0) {
                
                List<Sport> defaultSports = List.of(
                    createSport("Cricket", 2, "fa-baseball-bat-ball", "#EF4444"),
                    createSport("Badminton", 4, "fa-table-tennis-paddle-ball", "#a1e90fff"),
                    createSport("Basketball", 3, "fa-basketball", "#F97316"),
                    createSport("Volleyball", 2, "fa-volleyball", "#10B981"),
                    createSport("Pickleball", 2, "fa-table-tennis-paddle-ball", "#6366F1"),
                    createSport("Go-Karting", 1, "fa-gauge-high", "#F59E0B")
                );

                sportRepository.saveAll(defaultSports);
                System.out.println("Initialized default sports: " + defaultSports.size());
            }

            // 2. Initialize Default Price Plans (Crucial for Court setup)
            if (pricePlanRepository.count() == 0) {
                List<PricePlan> defaultPlans = List.of(
                    createPricePlan("09:00 AM", 400, 500),
                    createPricePlan("10:00 AM", 450, 550),
                    createPricePlan("07:00 PM", 600, 700),
                    createPricePlan("09:00 PM", 800, 900)
                );
                pricePlanRepository.saveAll(defaultPlans);
                System.out.println("Initialized default price plans: " + defaultPlans.size());
            }

            // 3. Initialize Default Venues
            if (venueRepository.count() == 0) {
                Venue v1 = createVenue("Sports Arena - Satellite", "Near Iskon Cross Road, Satellite, Ahmedabad");
                Venue v2 = createVenue("PlayZone - SG Highway", "Beside Karnavati Club, SG Highway, Ahmedabad");
                Venue v3 = createVenue("GameOn Sports Complex", "Bopal Cross Road, South Bopal, Ahmedabad");
                venueRepository.saveAll(List.of(v1, v2, v3));
                System.out.println("Initialized default venues: 3");
            }

            // 4. Initialize Default Courts (links Venue + Sport + PricePlan)
            if (courtRepository.count() == 0) {
                List<Venue> venues = venueRepository.findAll();
                List<PricePlan> plans = pricePlanRepository.findAll();

                if (venues.size() >= 3 && plans.size() >= 4) {
                    Long v1Id = venues.get(0).getId();
                    Long v2Id = venues.get(1).getId();
                    Long v3Id = venues.get(2).getId();

                    // Courts at Venue 1 - Sports Arena
                    courtRepository.saveAll(List.of(
                        createCourt(v1Id, "Cricket", "Cricket Ground A", plans.get(0).getId()),
                        createCourt(v1Id, "Cricket", "Cricket Ground B", plans.get(1).getId()),
                        createCourt(v1Id, "Badminton", "Badminton Court 1", plans.get(0).getId()),
                        createCourt(v1Id, "Badminton", "Badminton Court 2", plans.get(1).getId()),
                        createCourt(v1Id, "Badminton", "Badminton Court 3", plans.get(2).getId()),
                        createCourt(v1Id, "Basketball", "Basketball Court A", plans.get(2).getId()),
                        createCourt(v1Id, "Volleyball", "Volleyball Court 1", plans.get(0).getId()),
                        createCourt(v1Id, "Go-Karting", "Go-Kart Track 1", plans.get(3).getId())
                    ));

                    // Courts at Venue 2 - PlayZone
                    courtRepository.saveAll(List.of(
                        createCourt(v2Id, "Badminton", "Shuttle Court Alpha", plans.get(0).getId()),
                        createCourt(v2Id, "Badminton", "Shuttle Court Beta", plans.get(1).getId()),
                        createCourt(v2Id, "Pickleball", "Pickleball Court 1", plans.get(2).getId()),
                        createCourt(v2Id, "Pickleball", "Pickleball Court 2", plans.get(3).getId()),
                        createCourt(v2Id, "Basketball", "Hoops Court 1", plans.get(1).getId()),
                        createCourt(v2Id, "Basketball", "Hoops Court 2", plans.get(2).getId()),
                        createCourt(v2Id, "Cricket", "Cricket Turf X", plans.get(3).getId())
                    ));

                    // Courts at Venue 3 - GameOn
                    courtRepository.saveAll(List.of(
                        createCourt(v3Id, "Volleyball", "Volley Net A", plans.get(0).getId()),
                        createCourt(v3Id, "Volleyball", "Volley Net B", plans.get(1).getId()),
                        createCourt(v3Id, "Cricket", "Practice Pitch 1", plans.get(2).getId()),
                        createCourt(v3Id, "Badminton", "BMC Court 1", plans.get(0).getId()),
                        createCourt(v3Id, "Go-Karting", "Speed Track Alpha", plans.get(3).getId()),
                        createCourt(v3Id, "Pickleball", "Pickle Arena 1", plans.get(1).getId())
                    ));

                    System.out.println("Initialized default courts across 3 venues.");
                }
            }
        };
    }

    private Sport createSport(String name, int courtCount, String icon, String color) {
        Sport sport = new Sport();
        sport.setName(name);
        sport.setCourtCount(courtCount); 
        sport.setIcon(icon);
        sport.setColor(color);
        return sport;
    }
    
    private PricePlan createPricePlan(String timeSlot, int weekdayPrice, int weekendPrice) {
        PricePlan plan = new PricePlan();
        plan.setName("Standard - " + timeSlot);
        plan.setTimeSlot(timeSlot);
        plan.setWeekdayPrice(weekdayPrice);
        plan.setWeekendPrice(weekendPrice);
        return plan;
    }

    private Venue createVenue(String name, String address) {
        Venue venue = new Venue();
        venue.setName(name);
        venue.setAddress(address);
        return venue;
    }

    private Court createCourt(Long venueId, String sportName, String courtName, Long pricePlanId) {
        Court court = new Court();
        court.setVenueId(venueId);
        court.setSportName(sportName);
        court.setCourtName(courtName);
        court.setPricePlanId(pricePlanId);
        return court;
    }
}