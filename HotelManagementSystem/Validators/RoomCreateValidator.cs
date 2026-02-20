using FluentValidation;
using HotelManagementSystem.DTO;

namespace HotelManagementSystem.Validators
{
    public class RoomCreateValidator : AbstractValidator<RoomCreateDTO>
    {
        public RoomCreateValidator() 
        { 
            RuleFor(x => x.RoomNumber)
                .NotNull().WithMessage("RoomNumber is required.")
                .InclusiveBetween(100, 500).WithMessage("RoomNumber must be between 100 to 500.");

            RuleFor(x => x.RoomTypeId)
                .NotNull().WithMessage("RoomTypeId is required.")
                .GreaterThan(0).WithMessage("RoomTypeId must be greater than 0.");

            RuleFor(x => x.PricePerNight)
                .NotNull().WithMessage("PricePerNight is required.")
                .GreaterThan(0).WithMessage("PricePerNight must be greater than 0.");

            RuleFor(x => x.MaxOccupancy)
                .NotNull().WithMessage("MaxOccupancy is required.")
                .InclusiveBetween(1, 10).WithMessage("MaxOccupancy must be between 1 to 10.");

        }
    }
}
