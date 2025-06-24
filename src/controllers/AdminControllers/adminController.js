const adminService = require("../../services/AdminService");

module.exports = {
    readUsers: adminService.readAllUsers.bind(adminService),
    deleteUser: adminService.deleteAUser.bind(adminService),
    readApartments: adminService.readAllApartments.bind(adminService),
    deleteApartment: adminService.deleteAnApartment.bind(adminService),
    readBookingsForAUser: adminService.readAllBookingsForAUser.bind(adminService),
    readAUser: adminService.getAUser.bind(adminService),
    readAnApartment: adminService.getAnApartment.bind(adminService),
    getAnalytics: adminService.getAnalysis.bind(adminService)
}
