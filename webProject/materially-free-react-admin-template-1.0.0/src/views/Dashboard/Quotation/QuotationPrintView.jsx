import React, { forwardRef } from 'react';

import { Typography, Box } from '@mui/material';
// QuotationPrintView.jsx - CORRECTED VERSION

const QuotationPrintView = forwardRef((props, ref) => {
  const {
    formData,
    clientInfo,
    packageInfo,
    citiesData = [],
    hotelsData = [],
    sectorsData = [],
    clientType,
    newClientData,
    total_package_cost,
    advance_amount,
    grand_total,
    cost_per_person,
    total_stay_days,
    total_pax,
    accommodationTotal,
    transportationTotal,
    visaTotal,
    airlinesTotal
  } = props;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const safeText = (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    return String(value);
  };

  // Get client info based on type
  const currentClientInfo = clientType === 'existing' ? clientInfo : newClientData;
  const currentPackageInfo = packageInfo;

  // Helper function to get city name
  const getCityName = (cityID) => {
    if (!cityID) return 'N/A';
    const city = Array.isArray(citiesData) ? citiesData.find((c) => c?.cityID == cityID) : null;
    return city?.cityName || 'N/A';
  };

  // Helper function to get hotel name
  const getHotelName = (hotelID) => {
    if (!hotelID) return 'N/A';
    const hotel = Array.isArray(hotelsData) ? hotelsData.find((h) => h?.hotelID == hotelID) : null;
    return hotel?.hotelName || 'N/A';
  };

  // Helper function to get sector name
  const getSectorName = (sectorID) => {
    if (!sectorID) return 'N/A';
    const sector = Array.isArray(sectorsData) ? sectorsData.find((s) => s?.sectorID == sectorID) : null;
    return sector?.sectorName || 'N/A';
  };

  // Calculate individual accommodation totals
  const calculateAccommodationRowTotal = (acc) => {
    const nights = parseInt(acc.no_of_nights) || 0;
    const rooms = parseInt(acc.no_of_rooms) || 0;
    const rate = parseFloat(acc.rate_per_night) || 0;
    return rooms * nights * rate;
  };

  // Calculate individual transportation totals
  const calculateTransportationRowTotal = (trans) => {
    return (parseFloat(trans.rate) || 0) * (parseInt(trans.quantity) || 0);
  };

  // Calculate individual visa totals
  const calculateVisaRowTotal = (visa) => {
    return (parseFloat(visa.Rate) || 0) * (parseInt(visa.Qty) || 0);
  };

  // Calculate individual airline totals
  const calculateAirlineRowTotal = (airline) => {
    return (parseFloat(airline.rate) || 0) * (parseInt(airline.quantity) || 0);
  };

  return (
    <div
      ref={ref} // ✅ This is crucial - ref must be on the outermost div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#333',
        background: 'white',
        lineHeight: '1.4',
        minHeight: '100vh'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #2c5aa0', paddingBottom: '15px' }}>
        <h1 style={{ margin: '0', color: '#2c5aa0', fontSize: '24px', fontWeight: 'bold' }}>QUOTATION</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#666' }}>
          Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        {formData.quotation_number && (
          <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#666', fontWeight: 'bold' }}>
            Quotation #: {formData.quotation_number}
          </p>
        )}
      </div>

      {/* Client & Package Information */}
      <div style={{ marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', width: '20%', background: '#f8f9fa' }}>
                Client Name
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', width: '30%' }}>{safeText(currentClientInfo?.clientName)}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', width: '20%', background: '#f8f9fa' }}>
                Package Type
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', width: '30%' }}>
                {safeText(currentPackageInfo?.PackgeTitle || currentPackageInfo?.packgeTitle)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f8f9fa' }}>Contact Number</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{safeText(currentClientInfo?.contactNumber)}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f8f9fa' }}>Reference By</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{safeText(formData.reference_by)}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f8f9fa' }}>Traveling Details</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }} colSpan="3">
                {safeText(formData.traveling_details)}
              </td>
            </tr>
            {clientType === 'new' && (
              <>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f8f9fa' }}>WhatsApp Number</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{safeText(currentClientInfo?.whatsappNumber)}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f8f9fa' }}>
                    City of Residence
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{safeText(currentClientInfo?.cityOfResidence)}</td>
                </tr>
                {currentClientInfo?.groupHeadName && (
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f8f9fa' }}>Group Head</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }} colSpan="3">
                      {safeText(currentClientInfo?.groupHeadName)} - {safeText(currentClientInfo?.groupHeadNumber)}
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Trip Breakdown */}
      <div style={{ marginBottom: '20px', background: '#f0f7ff', padding: '15px', borderRadius: '8px', border: '1px solid #d1e3f8' }}>
        <h3 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#2c5aa0', fontSize: '16px', fontWeight: 'bold' }}>
          Trip Break-Up (In Nights)
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap' }}>
          {[
            { label: 'MAKKAH', value: formData.makkah_nights || '0' },
            { label: 'MADINAH', value: formData.madinah_nights || '0' },
            { label: 'MAKKAH (2nd)', value: formData.makkah_nights1 || '0' },
            { label: 'JEDDAH', value: formData.jeddah_nights || '0' }
          ].map((item, index) => (
            <div key={index} style={{ textAlign: 'center', flex: '1', minWidth: '120px', margin: '5px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#2c5aa0', marginBottom: '5px' }}>{item.label}</div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  background: 'white',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #2c5aa0'
                }}
              >
                {item.value} {parseInt(item.value) === 1 ? 'Night' : 'Nights'}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            background: '#2c5aa0',
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          <span>TOTAL STAY</span>
          <span>
            {total_stay_days} {total_stay_days === 1 ? 'Night' : 'Nights'}
          </span>
        </div>
      </div>

      {/* Passenger Information */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {[
            { label: 'ADULT', value: formData.adult_count || '0' },
            { label: 'CHILD', value: formData.child_count || '0' },
            { label: 'INFANT', value: formData.infant_count || '0' },
            { label: 'TOTAL PAX', value: total_pax, isTotal: true }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                textAlign: 'center',
                flex: '1',
                minWidth: '120px',
                padding: '12px',
                background: item.isTotal ? '#2c5aa0' : '#f8f9fa',
                color: item.isTotal ? 'white' : '#333',
                borderRadius: '6px',
                margin: '5px',
                border: item.isTotal ? 'none' : '1px solid #dee2e6'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>{item.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Accommodation Details */}
      {formData.accommodations && formData.accommodations.some((acc) => acc.cityID || acc.hotelID) && (
        <div style={{ marginBottom: '20px', pageBreakInside: 'avoid' }} className="no-break">
          <h3 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#2c5aa0', fontSize: '16px', fontWeight: 'bold' }}>
            Accommodation Details
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#2c5aa0', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'left', fontWeight: 'bold' }}>City</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'left', fontWeight: 'bold' }}>Hotel Name</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'center', fontWeight: 'bold' }}>Check In</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'center', fontWeight: 'bold' }}>Check Out</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'center', fontWeight: 'bold' }}>Room Type</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'center', fontWeight: 'bold' }}>Rooms</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'center', fontWeight: 'bold' }}>Nights</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'right', fontWeight: 'bold' }}>Rate/Night</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'right', fontWeight: 'bold' }}>Total (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {formData.accommodations
                .filter((acc) => acc.cityID || acc.hotelID)
                .map((acc, index) => {
                  const total = calculateAccommodationRowTotal(acc);

                  return (
                    <tr key={index} style={{ background: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>
                        {safeText(getCityName(acc.cityID)).toUpperCase()}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{safeText(getHotelName(acc.hotelID)).toUpperCase()}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{formatDate(acc.check_in)}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{formatDate(acc.check_out)}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '500' }}>
                        {(acc.room_type || 'SHARING').toUpperCase()}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '500' }}>
                        {safeText(acc.no_of_rooms || '0')}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '500' }}>
                        {safeText(acc.no_of_nights || '0')}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '500' }}>
                        {formatCurrency(parseFloat(acc.rate_per_night) || 0)}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#e9ecef', fontWeight: 'bold' }}>
                <td colSpan="8" style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '11px' }}>
                  Total Accommodation:
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '11px' }}>
                  {formatCurrency(accommodationTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
          <p style={{ fontSize: '9px', fontStyle: 'italic', color: '#666', marginTop: '8px', textAlign: 'center' }}>
            Note: Rooms are subject to availability & rates may change. Check-in & out time as per Hotel Policy.
          </p>
        </div>
      )}

      {/* Transportation Services */}
      {transportationTotal > 0 && formData.transportations && formData.transportations.some((trans) => trans.vehicle_name) && (
        <div style={{ marginBottom: '20px', pageBreakInside: 'avoid' }} className="no-break">
          <h3 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#2c5aa0', fontSize: '16px', fontWeight: 'bold' }}>
            Transportation Services + Ziarat
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#2c5aa0', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'left', fontWeight: 'bold' }}>Vehicle</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'left', fontWeight: 'bold' }}>Capacity</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'left', fontWeight: 'bold' }}>Sector</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'right', fontWeight: 'bold' }}>Rate</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'center', fontWeight: 'bold' }}>Quantity</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'right', fontWeight: 'bold' }}>Total (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {formData.transportations
                .filter((trans) => trans.vehicle_name)
                .map((trans, index) => {
                  const total = calculateTransportationRowTotal(trans);
                  return (
                    <tr key={index} style={{ background: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{safeText(trans.vehicle_name)}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{safeText(trans.capacity)}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{safeText(getSectorName(trans.sectorID))}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '500' }}>
                        {formatCurrency(parseFloat(trans.rate) || 0)}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '500' }}>
                        {safeText(trans.quantity || '0')}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#e9ecef', fontWeight: 'bold' }}>
                <td colSpan="5" style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '11px' }}>
                  Total Transportation:
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '11px' }}>
                  {formatCurrency(transportationTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Visa Services */}
      {visaTotal > 0 && formData.visas && formData.visas.some((visa) => visa.Description) && (
        <div style={{ marginBottom: '20px', pageBreakInside: 'avoid' }} className="no-break">
          <h3 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#2c5aa0', fontSize: '16px', fontWeight: 'bold' }}>
            Visa Services
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#2c5aa0', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'left', fontWeight: 'bold' }}>Description</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'right', fontWeight: 'bold' }}>Rate</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'center', fontWeight: 'bold' }}>Quantity</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'right', fontWeight: 'bold' }}>Total (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {formData.visas
                .filter((visa) => visa.Description)
                .map((visa, index) => {
                  const total = calculateVisaRowTotal(visa);
                  return (
                    <tr key={index} style={{ background: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{safeText(visa.Description)}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '500' }}>
                        {formatCurrency(parseFloat(visa.Rate) || 0)}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '500' }}>
                        {safeText(visa.Qty || '0')}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#e9ecef', fontWeight: 'bold' }}>
                <td colSpan="3" style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '11px' }}>
                  Total Visa:
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '11px' }}>
                  {formatCurrency(visaTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
          <p style={{ fontSize: '9px', fontStyle: 'italic', color: '#666', marginTop: '8px', textAlign: 'center' }}>
            Note: In case of rejection visa charges will be enclosed.
          </p>
        </div>
      )}

      {/* Airline Services */}
      {airlinesTotal > 0 && formData.airlines && formData.airlines.some((airline) => airline.carrier) && (
        <div style={{ marginBottom: '20px', pageBreakInside: 'avoid' }} className="no-break">
          <h3 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#2c5aa0', fontSize: '16px', fontWeight: 'bold' }}>
            Airline Services
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#2c5aa0', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'left', fontWeight: 'bold' }}>Carrier</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'left', fontWeight: 'bold' }}>Class</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'left', fontWeight: 'bold' }}>Sector</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'center', fontWeight: 'bold' }}>Pax</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'right', fontWeight: 'bold' }}>Rate</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'center', fontWeight: 'bold' }}>Quantity</th>
                <th style={{ padding: '10px', border: '1px solid #1e3d6d', textAlign: 'right', fontWeight: 'bold' }}>Total (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {formData.airlines
                .filter((airline) => airline.carrier)
                .map((airline, index) => {
                  const total = calculateAirlineRowTotal(airline);
                  return (
                    <tr key={index} style={{ background: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{safeText(airline.carrier)}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{safeText(airline.class)}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{safeText(airline.sector)}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '500' }}>
                        {safeText(airline.pax_count || '0')}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '500' }}>
                        {formatCurrency(parseFloat(airline.rate) || 0)}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: '500' }}>
                        {safeText(airline.quantity || '0')}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#e9ecef', fontWeight: 'bold' }}>
                <td colSpan="6" style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '11px' }}>
                  Total Airlines:
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '11px' }}>
                  {formatCurrency(airlinesTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Total Summary */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2c5aa0, #1e3d6d)',
          color: 'white',
          padding: '25px',
          borderRadius: '10px',
          marginTop: '25px',
          pageBreakInside: 'avoid'
        }}
        className="no-break"
      >
        <h3 style={{ textAlign: 'center', margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>Total Package Cost Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {[
            { label: 'Total Package Cost', value: total_package_cost },
            { label: 'Advance Amount', value: advance_amount },
            { label: 'Grand Total Amount', value: grand_total, highlight: true },
            { label: 'Cost Per Person', value: Math.round(cost_per_person), highlight: true }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>{item.label}</div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: item.highlight ? '#ffd54f' : 'white'
                }}
              >
                PKR {formatCurrency(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Notes */}
      <div
        style={{
          marginTop: '25px',
          padding: '15px',
          background: '#fff3cd',
          borderRadius: '8px',
          border: '2px solid #ffeaa7',
          pageBreakInside: 'avoid'
        }}
        className="no-break"
      >
        <p style={{ margin: '0', color: '#856404', fontWeight: '500', fontSize: '11px', textAlign: 'center' }}>
          <strong>REMARKS:</strong> Ticket and Room rates are subject to change without prior notice and subject to availability. Room rates
          may change due to USD rates. This quotation is valid for 7 days from the date of issue.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '25px',
          paddingTop: '20px',
          borderTop: '2px solid #2c5aa0',
          textAlign: 'center',
          fontSize: '10px',
          color: '#666'
        }}
      >
        <p style={{ margin: '5px 0', fontWeight: '500' }}>Thank you for your business!</p>
        <p style={{ margin: '3px 0' }}>
          <strong>Generated on:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p style={{ margin: '3px 0', fontStyle: 'italic' }}>
          For any queries, please contact us at: {currentClientInfo?.contactNumber || 'N/A'}
        </p>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0;
              padding: 0;
            }
            .page-break {
              page-break-before: always;
            }
            .no-break {
              page-break-inside: avoid;
            }
          }
        `}
      </style>
    </div>
  );
});

// Add display name for better debugging
QuotationPrintView.displayName = 'QuotationPrintView';

export default QuotationPrintView;
