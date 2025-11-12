using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClientController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/clients
        [HttpGet]
        public async Task<ActionResult> GetClients()
        {
            try
            {
                var clients = await _context.Clients
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
                
                return Ok(new { success = true, data = clients });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Failed to fetch clients", error = ex.Message });
            }
        }

        // GET: api/clients/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetClient(int id)
        {
            try
            {
                var client = await _context.Clients.FindAsync(id);

                if (client == null)
                {
                    return NotFound(new { success = false, message = "Client not found" });
                }

                return Ok(new { success = true, data = client });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Failed to fetch client", error = ex.Message });
            }
        }

        // POST: api/clients
        [HttpPost]
        public async Task<ActionResult> CreateClient(Client client)
        {
Console.WriteLine("fullname"+client.FullName);

            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Invalid data" });
                }

                client.CreatedAt = DateTime.UtcNow;
                _context.Clients.Add(client);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetClient), new { id = client.Id }, new { success = true, message = "Client created successfully", data = client });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Failed to create client", error = ex.Message });
            }
        }

        // PUT: api/clients/5
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateClient(int id, Client client)
        {
            try
            {
                if (id != client.Id)
                {
                    return BadRequest(new { success = false, message = "ID mismatch" });
                }

                var existingClient = await _context.Clients.FindAsync(id);
                if (existingClient == null)
                {
                    return NotFound(new { success = false, message = "Client not found" });
                }

                // Update properties
                existingClient.FullName = client.FullName;
                existingClient.ContactNumber = client.ContactNumber;
                existingClient.WhatsAppNumber = client.WhatsAppNumber;
                existingClient.GroupHeadName = client.GroupHeadName;
                existingClient.GroupHeadNumber = client.GroupHeadNumber;
                existingClient.CityOfResidence = client.CityOfResidence;
                existingClient.PassportValidity = client.PassportValidity;
                existingClient.SpecialRequirements = client.SpecialRequirements;
                existingClient.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Client updated successfully", data = existingClient });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Failed to update client", error = ex.Message });
            }
        }

        // DELETE: api/clients/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteClient(int id)
        {
            try
            {
                var client = await _context.Clients.FindAsync(id);
                if (client == null)
                {
                    return NotFound(new { success = false, message = "Client not found" });
                }

                _context.Clients.Remove(client);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Client deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Failed to delete client", error = ex.Message });
            }
        }
    }
}