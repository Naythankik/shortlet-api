const adminService = require("../../services/AdminService");

module.exports = {
    readUsers: adminService.readAllUsers.bind(adminService),
    readApartments: adminService.readAllApartments.bind(adminService),
    readBookingsForAUser: adminService.readAllBookingsForAUser.bind(adminService),
    readAUser: adminService.getAUser.bind(adminService),
    readAnApartment: adminService.getAnApartment.bind(adminService),
}
