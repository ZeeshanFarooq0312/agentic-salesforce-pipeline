using Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(builder.Configuration["AllowedOrigin"] ?? "http://localhost:5173")
     .AllowAnyHeader().AllowAnyMethod()));
var app = builder.Build();
app.UseCors();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/api/rating", (decimal revenue) =>
    revenue < 0
        ? Results.BadRequest(new { error = "revenue must be >= 0" })
        : Results.Ok(new { revenue, rating = RatingService.Rate(revenue) }));

app.Run();

public partial class Program;
