using System.Net.Http.Json;
using System.Text.Json;

namespace Api;

public record CreateAccountRequest(string? Name, decimal AnnualRevenue);
public record CreateAccountResult(string Id);

public class SalesforceException(string message) : Exception(message);

public interface ISalesforceClient
{
    Task<CreateAccountResult> CreateAccountAsync(CreateAccountRequest request, CancellationToken ct = default);
}

/// <summary>Creates Accounts through the Salesforce REST API. Auth comes from the HttpClient's headers.</summary>
public class SalesforceClient(HttpClient http) : ISalesforceClient
{
    public const string ApiVersion = "v62.0";

    // Salesforce field API names are PascalCase (Name, AnnualRevenue); do not camel-case them.
    private static readonly JsonSerializerOptions SalesforceJson = new() { PropertyNamingPolicy = null };

    public async Task<CreateAccountResult> CreateAccountAsync(CreateAccountRequest request, CancellationToken ct = default)
    {
        var res = await http.PostAsJsonAsync(
            $"services/data/{ApiVersion}/sobjects/Account",
            new { Name = request.Name, AnnualRevenue = request.AnnualRevenue },
            SalesforceJson,
            ct);

        if (!res.IsSuccessStatusCode)
        {
            var detail = await res.Content.ReadAsStringAsync(ct);
            throw new SalesforceException($"Salesforce returned {(int)res.StatusCode}: {detail}");
        }

        var body = await res.Content.ReadFromJsonAsync<JsonElement>(ct);
        return new CreateAccountResult(body.GetProperty("id").GetString()!);
    }
}
