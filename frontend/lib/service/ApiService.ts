import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

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
    static async getAvailableRoomsByDateAndType(checkInDate: string, checkOutDate: string, roomType: string) {
        const result = await axios.get(
            `${this.BASE_URL}/rooms/available-rooms-by-date-and-type?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomType=${roomType}`
        )
        return result.data
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

        const response = await axios.post(`${this.BASE_URL}/bookings/book-room/${roomId}/${userId}`, booking, {
            headers: this.getHeader()
        })
        return response.data
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

    static isUser() {
        if (typeof window === 'undefined') return false;
        const role = localStorage.getItem('role')
        console.log("ApiService - isUser check:", role === 'USER')
        return role === 'USER'
    }
}

