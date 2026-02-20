using FluentValidation;
using HotelManagementSystem.DTO;

namespace HotelManagementSystem.Validators
{
    public class RoomTypeCreateValidator : AbstractValidator<RoomTypeCreateDTO>
    {
        public RoomTypeCreateValidator()
        {
            RuleFor(x => x.TypeName)
                .NotEmpty().WithMessage("TypeName is required.")
                .MaximumLength(20).WithMessage("TypeName cannot exceed 20 characters.");

            RuleFor(x => x.BedCounts)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("BedCounts is required.")
                .GreaterThan(0).WithMessage("BedCounts must be greater than 0.")
                .LessThanOrEqualTo(10).WithMessage("BedCounts cannot exceed 10.");

            RuleFor(x => x.Description)
                .MaximumLength(100).WithMessage("Description cannot exceed 100 characters.");
        }
    }
}
