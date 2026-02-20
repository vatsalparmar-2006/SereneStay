using FluentValidation;
using HotelManagementSystem.DTO;
using HotelManagementSystem.Models;

namespace HotelManagementSystem.Validators
{
    public class BookingCreateValidator : AbstractValidator<BookingCreateDTO>
    {
        public BookingCreateValidator(HotelManagementSystemContext context)
        {
            RuleFor(x => x.GuestId)
                .Cascade(CascadeMode.Stop)
                .NotNull().WithMessage("GuestId is required.")
                .GreaterThan(0).WithMessage("GuestId must be greater than 0.")
                .Must(id => context.Guests.Any(g => g.GuestId == id))
                .WithMessage("Guest does not exist. Please create guest first.");

            RuleFor(x => x.RoomId)
                .Cascade(CascadeMode.Stop)
                .NotNull().WithMessage("RoomId is required.")
                .GreaterThan(0).WithMessage("RoomId must be greater than 0.")
                .Must(id => context.Rooms.Any(g => g.RoomId == id))
                .WithMessage("Guest does not exist. Please create guest first.");

            RuleFor(x => x.CheckInDate)
                .Cascade(CascadeMode.Stop)
                .NotNull().WithMessage("CheckInDate is required.")
                .LessThan(x => x.CheckOutDate).WithMessage("CheckInDate must be before CheckOutDate.");

            RuleFor(x => x.CheckOutDate)
                .Cascade(CascadeMode.Stop)
                .NotNull().WithMessage("CheckOutDate is required.")
                .GreaterThan(x => x.CheckInDate).WithMessage("CheckOutDate must be after CheckInDate.");
        }
    }
}
