namespace HotelManagementSystem.DTO
{
    public class ServicesDTO
    {
        public string ServiceName { get; set; }
        public decimal ServicePrice { get; set; }
    }
    public class DisplayServicesDTO
    {
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public decimal ServicePrice { get; set; }
    }

}
