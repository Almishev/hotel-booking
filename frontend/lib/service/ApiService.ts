import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";

export default class ApiService {

    static BASE_URL = BASE_URL;

    static getHeader() {
        if (typeof window === 'undefined') return {};
        const token = localStorage.getItem("token");
        const headers: any = {
            "Content-Type": "application/json"
        };
        // Only add Authorization header if token exists and is valid
        // Check for null, undefined, empty string, or string "null"
        if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    }

    /**AUTH */

    /* This  register a new user */
    static async registerUser(registration: any) {
        const response = await axios.post(`${this.BASE_URL}/auth/register`, registration)
        return response.data
    }

    /* This  login a registered user */
    static async loginUser(loginDetails: any) {
        const response = await axios.post(`${this.BASE_URL}/auth/login`, loginDetails)
        return response.data
    }

    /***USERS */


    /*  This is  to get the user profile */
    static async getAllUsers() {
        const response = await axios.get(`${this.BASE_URL}/users/all`, {
            headers: this.getHeader()
        })
        return response.data
    }

    static async getUserProfile() {
        const response = await axios.get(`${this.BASE_URL}/users/get-logged-in-profile-info`, {
            headers: this.getHeader()
        })
        return response.data
    }


    /* This is the  to get a single user */
    static async getUser(userId: string) {
        const response = await axios.get(`${this.BASE_URL}/users/get-by-id/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }

    /* This is the  to get user bookings by the user id */
    static async getUserBookings(userId: string) {
        const response = await axios.get(`${this.BASE_URL}/users/get-user-bookings/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }


    /* This is to delete a user */
    static async deleteUser(userId: string) {
        const response = await axios.delete(`${this.BASE_URL}/users/delete/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }

    /**ROOM */
    /* This  adds a new room room to the database */
    static async addRoom(formData: FormData) {
        const result = await axios.post(`${this.BASE_URL}/rooms/add`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return result.data;
    }

    /* This  gets all availavle rooms */
    static async getAllAvailableRooms() {
        const result = await axios.get(`${this.BASE_URL}/rooms/all-available-rooms`)
        return result.data
    }


    /* This  gets all availavle by dates rooms from the database with a given date and a room type */
    static async getAvailableRoomsByDateAndType(checkInDate: string, checkOutDate: string, roomType: string, packageId?: string) {
        let url = `${this.BASE_URL}/rooms/available-rooms-by-date-and-type?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomType=${roomType}`;
        if (packageId) {
            url += `&packageId=${packageId}`;
        }
        const result = await axios.get(url);
        return result.data;
    }

    /* This  gets all room types from thee database */
    static async getRoomTypes() {
        const response = await axios.get(`${this.BASE_URL}/rooms/types`)
        return response.data
    }
    /* This  gets all rooms from the database */
    static async getAllRooms() {
        const result = await axios.get(`${this.BASE_URL}/rooms/all`)
        return result.data
    }
    /* This funcction gets a room by the id */
    static async getRoomById(roomId: string) {
        const result = await axios.get(`${this.BASE_URL}/rooms/room-by-id/${roomId}`)
        return result.data
    }

    /* This  deletes a room by the Id */
    static async deleteRoom(roomId: string) {
        const result = await axios.delete(`${this.BASE_URL}/rooms/delete/${roomId}`, {
            headers: this.getHeader()
        })
        return result.data
    }

    /* This updates a room */
    static async updateRoom(roomId: string, formData: FormData) {
        const result = await axios.put(`${this.BASE_URL}/rooms/update/${roomId}`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return result.data;
    }


    /**BOOKING */
    /* This  saves a new booking to the databse */
    static async bookRoom(roomId: string, userId: string, booking: any) {

        console.log("USER ID IS: " + userId)

        try {
            // Extract language from booking object if present
            const language = booking.language || 'en';
            const bookingWithoutLanguage = { ...booking };
            delete bookingWithoutLanguage.language;
            
            const response = await axios.post(
                `${this.BASE_URL}/bookings/book-room/${roomId}/${userId}?language=${language}`, 
                bookingWithoutLanguage, 
                {
                    headers: this.getHeader()
                }
            )
            return response.data
        } catch (error: any) {
            // If backend returns error response with status code in body, return it
            if (error.response?.data && error.response.data.statusCode) {
                return error.response.data;
            }
            // Otherwise throw the error to be handled by caller
            throw error;
        }
    }

    /* This creates a booking from the admin panel (walk-in guest) */
    static async adminCreateBooking(roomId: string, payload: any) {
        const result = await axios.post(
            `${this.BASE_URL}/bookings/admin-booking/${roomId}`,
            payload,
            {
                headers: this.getHeader()
            }
        );
        return result.data;
    }

    /* This  gets alll bokings from the database */
    static async getAllBookings() {
        const result = await axios.get(`${this.BASE_URL}/bookings/all`, {
            headers: this.getHeader()
        })
        return result.data
    }

    /* This  get booking by the cnfirmation code */
    static async getBookingByConfirmationCode(bookingCode: string) {
        const result = await axios.get(`${this.BASE_URL}/bookings/get-by-confirmation-code/${bookingCode}`)
        return result.data
    }

    /* This is the  to cancel user booking */
    static async cancelBooking(bookingId: string) {
        const result = await axios.delete(`${this.BASE_URL}/bookings/cancel/${bookingId}`, {
            headers: this.getHeader()
        })
        return result.data
    }


    /**AUTHENTICATION CHECKER */
    static logout() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('jwt') // Clear any old JWT tokens
        // Dispatch custom event to notify Navbar about auth change
        window.dispatchEvent(new Event('auth-change'));
        console.log("Logged out - cleared all authentication data")
    }

    static isAuthenticated() {
        if (typeof window === 'undefined') return false;
        const token = localStorage.getItem('token')
        // Check if token exists and is not "null" string or empty
        const isValid = token && token !== 'null' && token.trim() !== '';
        console.log("ApiService - isAuthenticated check:", isValid)
        console.log("ApiService - Token value:", token ? token.substring(0, 20) + "..." : "null")
        return !!isValid
    }

    static isAdmin() {
        if (typeof window === 'undefined') return false;
        const role = localStorage.getItem('role')
        console.log("ApiService - isAdmin check:", role === 'ADMIN')
        return role === 'ADMIN'
    }

    static isEditor() {
        if (typeof window === 'undefined') return false;
        const role = localStorage.getItem('role');
        console.log("ApiService - isEditor check:", role === 'EDITOR');
        return role === 'EDITOR';
    }

    static isUser() {
        if (typeof window === 'undefined') return false;
        const role = localStorage.getItem('role')
        console.log("ApiService - isUser check:", role === 'USER')
        return role === 'USER'
    }

    /**HOLIDAY PACKAGES */
    /* This adds a new holiday package */
    static async addHolidayPackage(formData: FormData) {
        const result = await axios.post(`${this.BASE_URL}/holiday-packages/add`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return result.data;
    }

    /* This gets all holiday packages */
    static async getAllHolidayPackages() {
        const result = await axios.get(`${this.BASE_URL}/holiday-packages/all`);
        return result.data;
    }

    /* This gets a holiday package by id */
    static async getHolidayPackageById(packageId: string) {
        const result = await axios.get(`${this.BASE_URL}/holiday-packages/${packageId}`);
        return result.data;
    }

    /* This updates a holiday package */
    static async updateHolidayPackage(packageId: string, formData: FormData) {
        const result = await axios.put(`${this.BASE_URL}/holiday-packages/update/${packageId}`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return result.data;
    }

    /* This deletes a holiday package */
    static async deleteHolidayPackage(packageId: string) {
        const result = await axios.delete(`${this.BASE_URL}/holiday-packages/delete/${packageId}`, {
            headers: this.getHeader()
        });
        return result.data;
    }

    /* This gets active packages for room and dates */
    static async getActivePackagesForRoomAndDates(roomId: string, checkInDate: string, checkOutDate: string) {
        const result = await axios.get(
            `${this.BASE_URL}/holiday-packages/available?roomId=${roomId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
        );
        return result.data;
    }

    /**ROOM PRICE PERIODS */
    /* This adds a new room price period */
    static async addRoomPricePeriod(period: any) {
        const result = await axios.post(`${this.BASE_URL}/room-price-periods/add`, period, {
            headers: this.getHeader()
        });
        return result.data;
    }

    /* This gets all room price periods */
    static async getAllRoomPricePeriods() {
        const result = await axios.get(`${this.BASE_URL}/room-price-periods/all`, {
            headers: this.getHeader()
        });
        return result.data;
    }

    /* This gets room price periods by room type */
    static async getRoomPricePeriodsByRoomType(roomType: string) {
        const result = await axios.get(`${this.BASE_URL}/room-price-periods/by-room-type/${roomType}`, {
            headers: this.getHeader()
        });
        return result.data;
    }

    /* This gets a room price period by id */
    static async getRoomPricePeriodById(id: string) {
        const result = await axios.get(`${this.BASE_URL}/room-price-periods/${id}`, {
            headers: this.getHeader()
        });
        return result.data;
    }

    /* This updates a room price period */
    static async updateRoomPricePeriod(id: string, period: any) {
        const result = await axios.put(`${this.BASE_URL}/room-price-periods/update/${id}`, period, {
            headers: this.getHeader()
        });
        return result.data;
    }

    /* This deletes a room price period */
    static async deleteRoomPricePeriod(id: string) {
        const result = await axios.delete(`${this.BASE_URL}/room-price-periods/delete/${id}`, {
            headers: this.getHeader()
        });
        return result.data;
    }

    /* This calculates price for a room and date range */
    static async calculateRoomPrice(roomId: string, checkIn: string, checkOut: string) {
        const result = await axios.get(
            `${this.BASE_URL}/rooms/price-calculation?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`
        );
        return result.data;
    }
}

