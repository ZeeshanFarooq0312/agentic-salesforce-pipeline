using System.Net.Http.Headers;
using Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(builder.Configuration["AllowedOrigin"] ?? "http://localhost:5173")
     .AllowAnyHeader().AllowAnyMethod()));

// SF_INSTANCE_URL / SF_ACCESS_TOKEN come from environment variables or a secret store, never source.
builder.Services.AddHttpClient<ISalesforceClient, SalesforceClient>(c =>
{
    c.BaseAddress = new Uri(builder.Configuration["SF_INSTANCE_URL"] ?? "https://salesforce.invalid/");
    var token = builder.Configuration["SF_ACCESS_TOKEN"];
    if (!string.IsNullOrEmpty(token))
        c.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
});

var app = builder.Build();
app.UseCors();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/api/rating", (decimal revenue) =>
    revenue < 0
        ? Results.BadRequest(new { error = "revenue must be >= 0" })
        : Results.Ok(new { revenue, rating = RatingService.Rate(revenue) }));

app.MapPost("/api/accounts", async (CreateAccountRequest request, ISalesforceClient salesforce, CancellationToken ct) =>
{
    var errors = AccountValidation.Validate(request);
    if (errors.Count > 0) return Results.BadRequest(new { errors });

    try
    {
        var created = await salesforce.CreateAccountAsync(request, ct);
        return Results.Created($"/api/accounts/{created.Id}", created);
    }
    catch (SalesforceException ex)
    {
        return Results.Problem(ex.Message, statusCode: StatusCodes.Status502BadGateway);
    }
});

app.Run();

public partial class Program;
