using FluentValidation;
using HotelManagementSystem.DTO;

namespace HotelManagementSystem.Validators
{
    public class ServiceUsageValidator : AbstractValidator<ServiceUsageCreateDTO>
    {
        public ServiceUsageValidator() 
        {
            RuleFor(x => x.BookingId)
                .NotNull().WithMessage("BookingId is required.")
                .GreaterThan(0).WithMessage("BookingId must be greater than 0.");

            RuleFor(x => x.ServiceId)
                .NotNull().WithMessage("ServiceId is required.")
                .GreaterThan(0).WithMessage("ServiceId must be greater than 0.");

            RuleFor(x => x.Quantity)
                .NotNull().WithMessage("Quantity is required.")
                .GreaterThan(0).WithMessage("Quantity must be greater than 0.");
        }
    }
}
