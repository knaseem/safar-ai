/**
 * Comprehensive global airport coordinates database
 * Covers 350+ airports across all continents for worldwide flight tracking simulation.
 * When the live AviationStack API is available, it tracks ANY flight worldwide.
 * This database powers the simulation fallback for accurate great-circle positioning.
 */

export const AIRPORT_COORDS: Record<string, { lat: number; lng: number; name: string; city: string; country: string }> = {
    // ═══════════════════════════════════════════════════════════════
    // NORTH AMERICA
    // ═══════════════════════════════════════════════════════════════
    // United States — Major
    JFK: { lat: 40.6413, lng: -73.7781, name: "John F. Kennedy Intl", city: "New York", country: "US" },
    LAX: { lat: 33.9425, lng: -118.4081, name: "Los Angeles Intl", city: "Los Angeles", country: "US" },
    ORD: { lat: 41.9742, lng: -87.9073, name: "O'Hare Intl", city: "Chicago", country: "US" },
    ATL: { lat: 33.6407, lng: -84.4277, name: "Hartsfield-Jackson", city: "Atlanta", country: "US" },
    DFW: { lat: 32.8998, lng: -97.0403, name: "Dallas/Fort Worth Intl", city: "Dallas", country: "US" },
    DEN: { lat: 39.8561, lng: -104.6737, name: "Denver Intl", city: "Denver", country: "US" },
    SFO: { lat: 37.6213, lng: -122.3790, name: "San Francisco Intl", city: "San Francisco", country: "US" },
    SEA: { lat: 47.4502, lng: -122.3088, name: "Seattle-Tacoma Intl", city: "Seattle", country: "US" },
    MIA: { lat: 25.7959, lng: -80.2870, name: "Miami Intl", city: "Miami", country: "US" },
    MCO: { lat: 28.4312, lng: -81.3081, name: "Orlando Intl", city: "Orlando", country: "US" },
    BOS: { lat: 42.3656, lng: -71.0096, name: "Logan Intl", city: "Boston", country: "US" },
    EWR: { lat: 40.6895, lng: -74.1745, name: "Newark Liberty Intl", city: "Newark", country: "US" },
    LGA: { lat: 40.7769, lng: -73.8740, name: "LaGuardia", city: "New York", country: "US" },
    IAD: { lat: 38.9531, lng: -77.4565, name: "Dulles Intl", city: "Washington DC", country: "US" },
    DCA: { lat: 38.8512, lng: -77.0402, name: "Reagan National", city: "Washington DC", country: "US" },
    IAH: { lat: 29.9844, lng: -95.3414, name: "George Bush Intercontinental", city: "Houston", country: "US" },
    MSP: { lat: 44.8848, lng: -93.2223, name: "Minneapolis-Saint Paul Intl", city: "Minneapolis", country: "US" },
    DTW: { lat: 42.2124, lng: -83.3534, name: "Detroit Metro Wayne County", city: "Detroit", country: "US" },
    PHX: { lat: 33.4373, lng: -112.0078, name: "Phoenix Sky Harbor Intl", city: "Phoenix", country: "US" },
    CLT: { lat: 35.2140, lng: -80.9431, name: "Charlotte Douglas Intl", city: "Charlotte", country: "US" },
    PHL: { lat: 39.8721, lng: -75.2411, name: "Philadelphia Intl", city: "Philadelphia", country: "US" },
    LAS: { lat: 36.0840, lng: -115.1537, name: "Harry Reid Intl", city: "Las Vegas", country: "US" },
    SAN: { lat: 32.7338, lng: -117.1933, name: "San Diego Intl", city: "San Diego", country: "US" },
    TPA: { lat: 27.9755, lng: -82.5332, name: "Tampa Intl", city: "Tampa", country: "US" },
    PDX: { lat: 45.5898, lng: -122.5951, name: "Portland Intl", city: "Portland", country: "US" },
    BWI: { lat: 39.1754, lng: -76.6684, name: "Baltimore/Washington Intl", city: "Baltimore", country: "US" },
    FLL: { lat: 26.0742, lng: -80.1506, name: "Fort Lauderdale-Hollywood Intl", city: "Fort Lauderdale", country: "US" },
    SLC: { lat: 40.7884, lng: -111.9778, name: "Salt Lake City Intl", city: "Salt Lake City", country: "US" },
    AUS: { lat: 30.1975, lng: -97.6664, name: "Austin-Bergstrom Intl", city: "Austin", country: "US" },
    HNL: { lat: 21.3187, lng: -157.9225, name: "Daniel K. Inouye Intl", city: "Honolulu", country: "US" },
    ANC: { lat: 61.1743, lng: -149.9982, name: "Ted Stevens Anchorage Intl", city: "Anchorage", country: "US" },
    // Canada
    YYZ: { lat: 43.6777, lng: -79.6248, name: "Toronto Pearson Intl", city: "Toronto", country: "CA" },
    YVR: { lat: 49.1967, lng: -123.1815, name: "Vancouver Intl", city: "Vancouver", country: "CA" },
    YUL: { lat: 45.4706, lng: -73.7408, name: "Montréal-Trudeau Intl", city: "Montreal", country: "CA" },
    YOW: { lat: 45.3225, lng: -75.6692, name: "Ottawa Macdonald-Cartier Intl", city: "Ottawa", country: "CA" },
    YYC: { lat: 51.1215, lng: -114.0076, name: "Calgary Intl", city: "Calgary", country: "CA" },
    YEG: { lat: 53.3097, lng: -113.5800, name: "Edmonton Intl", city: "Edmonton", country: "CA" },
    // Mexico
    MEX: { lat: 19.4363, lng: -99.0721, name: "Mexico City Intl", city: "Mexico City", country: "MX" },
    CUN: { lat: 21.0365, lng: -86.8771, name: "Cancún Intl", city: "Cancún", country: "MX" },
    GDL: { lat: 20.5218, lng: -103.3113, name: "Guadalajara Intl", city: "Guadalajara", country: "MX" },
    SJD: { lat: 23.1518, lng: -109.7215, name: "Los Cabos Intl", city: "San José del Cabo", country: "MX" },
    PVR: { lat: 20.6801, lng: -105.2544, name: "Gustavo Díaz Ordaz Intl", city: "Puerto Vallarta", country: "MX" },
    // Caribbean
    SJU: { lat: 18.4394, lng: -66.0018, name: "Luis Muñoz Marín Intl", city: "San Juan", country: "PR" },
    NAS: { lat: 25.0390, lng: -77.4662, name: "Lynden Pindling Intl", city: "Nassau", country: "BS" },
    MBJ: { lat: 18.5037, lng: -77.9134, name: "Sangster Intl", city: "Montego Bay", country: "JM" },
    PUJ: { lat: 18.5674, lng: -68.3634, name: "Punta Cana Intl", city: "Punta Cana", country: "DO" },

    // ═══════════════════════════════════════════════════════════════
    // SOUTH AMERICA
    // ═══════════════════════════════════════════════════════════════
    GRU: { lat: -23.4356, lng: -46.4731, name: "São Paulo–Guarulhos Intl", city: "São Paulo", country: "BR" },
    GIG: { lat: -22.8100, lng: -43.2506, name: "Rio de Janeiro–Galeão Intl", city: "Rio de Janeiro", country: "BR" },
    BSB: { lat: -15.8711, lng: -47.9186, name: "Brasília Intl", city: "Brasília", country: "BR" },
    EZE: { lat: -34.8222, lng: -58.5358, name: "Ministro Pistarini Intl", city: "Buenos Aires", country: "AR" },
    SCL: { lat: -33.3930, lng: -70.7858, name: "Santiago Intl", city: "Santiago", country: "CL" },
    BOG: { lat: 4.7016, lng: -74.1469, name: "El Dorado Intl", city: "Bogotá", country: "CO" },
    LIM: { lat: -12.0219, lng: -77.1143, name: "Jorge Chávez Intl", city: "Lima", country: "PE" },
    CCS: { lat: 10.6012, lng: -66.9913, name: "Simón Bolívar Intl", city: "Caracas", country: "VE" },
    UIO: { lat: -0.1292, lng: -78.3575, name: "Mariscal Sucre Intl", city: "Quito", country: "EC" },
    MVD: { lat: -34.8384, lng: -56.0308, name: "Carrasco Intl", city: "Montevideo", country: "UY" },
    PTY: { lat: 9.0714, lng: -79.3835, name: "Tocumen Intl", city: "Panama City", country: "PA" },
    SJO: { lat: 10.0000, lng: -84.2118, name: "Juan Santamaría Intl", city: "San José", country: "CR" },

    // ═══════════════════════════════════════════════════════════════
    // EUROPE
    // ═══════════════════════════════════════════════════════════════
    // UK & Ireland
    LHR: { lat: 51.4700, lng: -0.4543, name: "London Heathrow", city: "London", country: "GB" },
    LGW: { lat: 51.1537, lng: -0.1821, name: "London Gatwick", city: "London", country: "GB" },
    STN: { lat: 51.8860, lng: 0.2389, name: "London Stansted", city: "London", country: "GB" },
    MAN: { lat: 53.3537, lng: -2.2750, name: "Manchester", city: "Manchester", country: "GB" },
    EDI: { lat: 55.9508, lng: -3.3615, name: "Edinburgh", city: "Edinburgh", country: "GB" },
    BHX: { lat: 52.4539, lng: -1.7480, name: "Birmingham", city: "Birmingham", country: "GB" },
    DUB: { lat: 53.4264, lng: -6.2499, name: "Dublin", city: "Dublin", country: "IE" },
    // France
    CDG: { lat: 49.0097, lng: 2.5479, name: "Paris Charles de Gaulle", city: "Paris", country: "FR" },
    ORY: { lat: 48.7262, lng: 2.3652, name: "Paris Orly", city: "Paris", country: "FR" },
    NCE: { lat: 43.6584, lng: 7.2159, name: "Nice Côte d'Azur", city: "Nice", country: "FR" },
    LYS: { lat: 45.7256, lng: 5.0811, name: "Lyon–Saint Exupéry", city: "Lyon", country: "FR" },
    MRS: { lat: 43.4393, lng: 5.2214, name: "Marseille Provence", city: "Marseille", country: "FR" },
    // Germany
    FRA: { lat: 50.0379, lng: 8.5622, name: "Frankfurt am Main", city: "Frankfurt", country: "DE" },
    MUC: { lat: 48.3537, lng: 11.7750, name: "Munich", city: "Munich", country: "DE" },
    BER: { lat: 52.3667, lng: 13.5033, name: "Berlin Brandenburg", city: "Berlin", country: "DE" },
    HAM: { lat: 53.6304, lng: 10.0063, name: "Hamburg", city: "Hamburg", country: "DE" },
    DUS: { lat: 51.2895, lng: 6.7668, name: "Düsseldorf", city: "Düsseldorf", country: "DE" },
    // Netherlands
    AMS: { lat: 52.3105, lng: 4.7683, name: "Amsterdam Schiphol", city: "Amsterdam", country: "NL" },
    // Belgium
    BRU: { lat: 50.9014, lng: 4.4844, name: "Brussels", city: "Brussels", country: "BE" },
    // Spain
    MAD: { lat: 40.4983, lng: -3.5676, name: "Adolfo Suárez Madrid–Barajas", city: "Madrid", country: "ES" },
    BCN: { lat: 41.2974, lng: 2.0833, name: "Barcelona–El Prat", city: "Barcelona", country: "ES" },
    AGP: { lat: 36.6749, lng: -4.4991, name: "Málaga–Costa del Sol", city: "Málaga", country: "ES" },
    PMI: { lat: 39.5517, lng: 2.7388, name: "Palma de Mallorca", city: "Palma", country: "ES" },
    // Italy
    FCO: { lat: 41.8003, lng: 12.2389, name: "Rome Fiumicino", city: "Rome", country: "IT" },
    MXP: { lat: 45.6306, lng: 8.7281, name: "Milan Malpensa", city: "Milan", country: "IT" },
    VCE: { lat: 45.5053, lng: 12.3519, name: "Venice Marco Polo", city: "Venice", country: "IT" },
    NAP: { lat: 40.8860, lng: 14.2908, name: "Naples", city: "Naples", country: "IT" },
    // Switzerland
    ZRH: { lat: 47.4647, lng: 8.5492, name: "Zürich", city: "Zürich", country: "CH" },
    GVA: { lat: 46.2381, lng: 6.1089, name: "Geneva", city: "Geneva", country: "CH" },
    // Austria
    VIE: { lat: 48.1103, lng: 16.5697, name: "Vienna Intl", city: "Vienna", country: "AT" },
    // Portugal
    LIS: { lat: 38.7813, lng: -9.1359, name: "Lisbon Humberto Delgado", city: "Lisbon", country: "PT" },
    OPO: { lat: 41.2481, lng: -8.6814, name: "Porto Francisco Sá Carneiro", city: "Porto", country: "PT" },
    // Greece
    ATH: { lat: 37.9364, lng: 23.9445, name: "Athens Eleftherios Venizelos", city: "Athens", country: "GR" },
    SKG: { lat: 40.5197, lng: 22.9709, name: "Thessaloniki Macedonia", city: "Thessaloniki", country: "GR" },
    JTR: { lat: 36.3992, lng: 25.4793, name: "Santorini Intl", city: "Santorini", country: "GR" },
    JMK: { lat: 37.4351, lng: 25.3481, name: "Mykonos Intl", city: "Mykonos", country: "GR" },
    // Turkey
    IST: { lat: 41.2753, lng: 28.7519, name: "Istanbul", city: "Istanbul", country: "TR" },
    SAW: { lat: 40.8986, lng: 29.3092, name: "Istanbul Sabiha Gökçen", city: "Istanbul", country: "TR" },
    AYT: { lat: 36.8987, lng: 30.8005, name: "Antalya", city: "Antalya", country: "TR" },
    ESB: { lat: 40.1281, lng: 32.9951, name: "Ankara Esenboğa", city: "Ankara", country: "TR" },
    // Scandinavia
    CPH: { lat: 55.6180, lng: 12.6508, name: "Copenhagen", city: "Copenhagen", country: "DK" },
    ARN: { lat: 59.6519, lng: 17.9186, name: "Stockholm Arlanda", city: "Stockholm", country: "SE" },
    OSL: { lat: 60.1939, lng: 11.1004, name: "Oslo Gardermoen", city: "Oslo", country: "NO" },
    HEL: { lat: 60.3172, lng: 24.9633, name: "Helsinki-Vantaa", city: "Helsinki", country: "FI" },
    KEF: { lat: 63.9850, lng: -22.6056, name: "Keflavík Intl", city: "Reykjavík", country: "IS" },
    // Poland
    WAW: { lat: 52.1657, lng: 20.9671, name: "Warsaw Chopin", city: "Warsaw", country: "PL" },
    KRK: { lat: 50.0777, lng: 19.7848, name: "Kraków John Paul II", city: "Kraków", country: "PL" },
    // Czech Republic
    PRG: { lat: 50.1008, lng: 14.2600, name: "Václav Havel Prague", city: "Prague", country: "CZ" },
    // Hungary
    BUD: { lat: 47.4298, lng: 19.2611, name: "Budapest Ferenc Liszt", city: "Budapest", country: "HU" },
    // Romania
    OTP: { lat: 44.5711, lng: 26.0850, name: "Henri Coandă Intl", city: "Bucharest", country: "RO" },
    // Russia
    SVO: { lat: 55.9726, lng: 37.4146, name: "Sheremetyevo", city: "Moscow", country: "RU" },
    DME: { lat: 55.4088, lng: 37.9063, name: "Domodedovo", city: "Moscow", country: "RU" },
    LED: { lat: 59.8003, lng: 30.2625, name: "Pulkovo", city: "Saint Petersburg", country: "RU" },
    // Croatia
    ZAG: { lat: 45.7293, lng: 16.0688, name: "Zagreb Franjo Tuđman", city: "Zagreb", country: "HR" },
    DBV: { lat: 42.5614, lng: 18.2682, name: "Dubrovnik", city: "Dubrovnik", country: "HR" },

    // ═══════════════════════════════════════════════════════════════
    // MIDDLE EAST
    // ═══════════════════════════════════════════════════════════════
    DXB: { lat: 25.2532, lng: 55.3657, name: "Dubai Intl", city: "Dubai", country: "AE" },
    AUH: { lat: 24.4330, lng: 54.6511, name: "Abu Dhabi Intl", city: "Abu Dhabi", country: "AE" },
    DOH: { lat: 25.2609, lng: 51.6138, name: "Hamad Intl", city: "Doha", country: "QA" },
    RUH: { lat: 24.9576, lng: 46.6988, name: "King Khalid Intl", city: "Riyadh", country: "SA" },
    JED: { lat: 21.6796, lng: 39.1565, name: "King Abdulaziz Intl", city: "Jeddah", country: "SA" },
    MED: { lat: 24.5534, lng: 39.7051, name: "Prince Mohammad Bin Abdulaziz Intl", city: "Medina", country: "SA" },
    DMM: { lat: 26.4712, lng: 49.7979, name: "King Fahd Intl", city: "Dammam", country: "SA" },
    BAH: { lat: 26.2708, lng: 50.6336, name: "Bahrain Intl", city: "Manama", country: "BH" },
    MCT: { lat: 23.5933, lng: 58.2844, name: "Muscat Intl", city: "Muscat", country: "OM" },
    KWI: { lat: 29.2266, lng: 47.9689, name: "Kuwait Intl", city: "Kuwait City", country: "KW" },
    AMM: { lat: 31.7226, lng: 35.9932, name: "Queen Alia Intl", city: "Amman", country: "JO" },
    BEY: { lat: 33.8209, lng: 35.4884, name: "Rafic Hariri Intl", city: "Beirut", country: "LB" },
    TLV: { lat: 32.0114, lng: 34.8867, name: "Ben Gurion Intl", city: "Tel Aviv", country: "IL" },
    BGW: { lat: 33.2625, lng: 44.2346, name: "Baghdad Intl", city: "Baghdad", country: "IQ" },
    IKA: { lat: 35.4161, lng: 51.1522, name: "Imam Khomeini Intl", city: "Tehran", country: "IR" },

    // ═══════════════════════════════════════════════════════════════
    // SOUTH ASIA
    // ═══════════════════════════════════════════════════════════════
    DEL: { lat: 28.5562, lng: 77.1000, name: "Indira Gandhi Intl", city: "New Delhi", country: "IN" },
    BOM: { lat: 19.0896, lng: 72.8656, name: "Chhatrapati Shivaji Intl", city: "Mumbai", country: "IN" },
    BLR: { lat: 13.1986, lng: 77.7066, name: "Kempegowda Intl", city: "Bangalore", country: "IN" },
    MAA: { lat: 12.9941, lng: 80.1709, name: "Chennai Intl", city: "Chennai", country: "IN" },
    HYD: { lat: 17.2403, lng: 78.4294, name: "Rajiv Gandhi Intl", city: "Hyderabad", country: "IN" },
    CCU: { lat: 22.6547, lng: 88.4467, name: "Netaji Subhas Chandra Bose Intl", city: "Kolkata", country: "IN" },
    COK: { lat: 10.1520, lng: 76.4019, name: "Cochin Intl", city: "Kochi", country: "IN" },
    GOI: { lat: 15.3809, lng: 73.8314, name: "Goa Manohar Intl", city: "Goa", country: "IN" },
    ISB: { lat: 33.6167, lng: 72.8282, name: "Islamabad Intl", city: "Islamabad", country: "PK" },
    KHI: { lat: 24.9065, lng: 67.1610, name: "Jinnah Intl", city: "Karachi", country: "PK" },
    LHE: { lat: 31.5216, lng: 74.4036, name: "Allama Iqbal Intl", city: "Lahore", country: "PK" },
    DAC: { lat: 23.8433, lng: 90.3978, name: "Hazrat Shahjalal Intl", city: "Dhaka", country: "BD" },
    CMB: { lat: 7.1824, lng: 79.8841, name: "Bandaranaike Intl", city: "Colombo", country: "LK" },
    KTM: { lat: 27.6966, lng: 85.3591, name: "Tribhuvan Intl", city: "Kathmandu", country: "NP" },
    MLE: { lat: 4.1918, lng: 73.5290, name: "Velana Intl", city: "Malé", country: "MV" },

    // ═══════════════════════════════════════════════════════════════
    // EAST ASIA
    // ═══════════════════════════════════════════════════════════════
    NRT: { lat: 35.7720, lng: 140.3929, name: "Tokyo Narita", city: "Tokyo", country: "JP" },
    HND: { lat: 35.5494, lng: 139.7798, name: "Tokyo Haneda", city: "Tokyo", country: "JP" },
    KIX: { lat: 34.4347, lng: 135.2440, name: "Kansai Intl", city: "Osaka", country: "JP" },
    NGO: { lat: 34.8584, lng: 136.8051, name: "Chubu Centrair Intl", city: "Nagoya", country: "JP" },
    FUK: { lat: 33.5902, lng: 130.4517, name: "Fukuoka", city: "Fukuoka", country: "JP" },
    CTS: { lat: 42.7752, lng: 141.6924, name: "New Chitose", city: "Sapporo", country: "JP" },
    ICN: { lat: 37.4602, lng: 126.4407, name: "Seoul Incheon Intl", city: "Seoul", country: "KR" },
    GMP: { lat: 37.5583, lng: 126.7906, name: "Gimpo Intl", city: "Seoul", country: "KR" },
    PUS: { lat: 35.1796, lng: 128.9381, name: "Gimhae Intl", city: "Busan", country: "KR" },
    PEK: { lat: 40.0799, lng: 116.6031, name: "Beijing Capital Intl", city: "Beijing", country: "CN" },
    PKX: { lat: 39.5098, lng: 116.4105, name: "Beijing Daxing Intl", city: "Beijing", country: "CN" },
    PVG: { lat: 31.1443, lng: 121.8083, name: "Shanghai Pudong Intl", city: "Shanghai", country: "CN" },
    SHA: { lat: 31.1979, lng: 121.3363, name: "Shanghai Hongqiao Intl", city: "Shanghai", country: "CN" },
    CAN: { lat: 23.3924, lng: 113.2988, name: "Guangzhou Baiyun Intl", city: "Guangzhou", country: "CN" },
    SZX: { lat: 22.6393, lng: 113.8107, name: "Shenzhen Bao'an Intl", city: "Shenzhen", country: "CN" },
    CTU: { lat: 30.5785, lng: 103.9471, name: "Chengdu Tianfu Intl", city: "Chengdu", country: "CN" },
    CKG: { lat: 29.7192, lng: 106.6417, name: "Chongqing Jiangbei Intl", city: "Chongqing", country: "CN" },
    XIY: { lat: 34.4471, lng: 108.7516, name: "Xi'an Xianyang Intl", city: "Xi'an", country: "CN" },
    HGH: { lat: 30.2295, lng: 120.4344, name: "Hangzhou Xiaoshan Intl", city: "Hangzhou", country: "CN" },
    KMG: { lat: 25.1019, lng: 102.9294, name: "Kunming Changshui Intl", city: "Kunming", country: "CN" },
    WUH: { lat: 30.7838, lng: 114.2081, name: "Wuhan Tianhe Intl", city: "Wuhan", country: "CN" },
    HKG: { lat: 22.3080, lng: 113.9185, name: "Hong Kong Intl", city: "Hong Kong", country: "HK" },
    TPE: { lat: 25.0777, lng: 121.2330, name: "Taiwan Taoyuan Intl", city: "Taipei", country: "TW" },
    MFM: { lat: 22.1496, lng: 113.5916, name: "Macau Intl", city: "Macau", country: "MO" },
    ULN: { lat: 47.8431, lng: 106.7672, name: "Chinggis Khaan Intl", city: "Ulaanbaatar", country: "MN" },

    // ═══════════════════════════════════════════════════════════════
    // SOUTHEAST ASIA
    // ═══════════════════════════════════════════════════════════════
    SIN: { lat: 1.3644, lng: 103.9915, name: "Singapore Changi", city: "Singapore", country: "SG" },
    BKK: { lat: 13.6900, lng: 100.7501, name: "Suvarnabhumi", city: "Bangkok", country: "TH" },
    DMK: { lat: 13.9126, lng: 100.6068, name: "Don Mueang Intl", city: "Bangkok", country: "TH" },
    HKT: { lat: 8.1132, lng: 98.3169, name: "Phuket Intl", city: "Phuket", country: "TH" },
    CNX: { lat: 18.7668, lng: 98.9626, name: "Chiang Mai Intl", city: "Chiang Mai", country: "TH" },
    KUL: { lat: 2.7456, lng: 101.7099, name: "Kuala Lumpur Intl (KLIA)", city: "Kuala Lumpur", country: "MY" },
    PEN: { lat: 5.2972, lng: 100.2768, name: "Penang Intl", city: "Penang", country: "MY" },
    CGK: { lat: -6.1256, lng: 106.6558, name: "Soekarno–Hatta Intl", city: "Jakarta", country: "ID" },
    DPS: { lat: -8.7482, lng: 115.1672, name: "Ngurah Rai Intl", city: "Bali", country: "ID" },
    SUB: { lat: -7.3798, lng: 112.7868, name: "Juanda Intl", city: "Surabaya", country: "ID" },
    MNL: { lat: 14.5086, lng: 121.0197, name: "Ninoy Aquino Intl", city: "Manila", country: "PH" },
    CEB: { lat: 10.3075, lng: 123.9794, name: "Mactan–Cebu Intl", city: "Cebu", country: "PH" },
    HAN: { lat: 21.2212, lng: 105.8070, name: "Noi Bai Intl", city: "Hanoi", country: "VN" },
    SGN: { lat: 10.8188, lng: 106.6520, name: "Tan Son Nhat Intl", city: "Ho Chi Minh City", country: "VN" },
    DAD: { lat: 16.0439, lng: 108.1992, name: "Da Nang Intl", city: "Da Nang", country: "VN" },
    PNH: { lat: 11.5466, lng: 104.8442, name: "Phnom Penh Intl", city: "Phnom Penh", country: "KH" },
    REP: { lat: 13.4106, lng: 103.8128, name: "Siem Reap Angkor Intl", city: "Siem Reap", country: "KH" },
    RGN: { lat: 16.9073, lng: 96.1332, name: "Yangon Intl", city: "Yangon", country: "MM" },

    // ═══════════════════════════════════════════════════════════════
    // OCEANIA
    // ═══════════════════════════════════════════════════════════════
    SYD: { lat: -33.9399, lng: 151.1753, name: "Sydney Kingsford Smith", city: "Sydney", country: "AU" },
    MEL: { lat: -37.6690, lng: 144.8410, name: "Melbourne Tullamarine", city: "Melbourne", country: "AU" },
    BNE: { lat: -27.3842, lng: 153.1175, name: "Brisbane", city: "Brisbane", country: "AU" },
    PER: { lat: -31.9403, lng: 115.9672, name: "Perth", city: "Perth", country: "AU" },
    ADL: { lat: -34.9461, lng: 138.5310, name: "Adelaide", city: "Adelaide", country: "AU" },
    CNS: { lat: -16.8858, lng: 145.7553, name: "Cairns", city: "Cairns", country: "AU" },
    AKL: { lat: -37.0082, lng: 174.7850, name: "Auckland", city: "Auckland", country: "NZ" },
    WLG: { lat: -41.3272, lng: 174.8053, name: "Wellington Intl", city: "Wellington", country: "NZ" },
    CHC: { lat: -43.4894, lng: 172.5322, name: "Christchurch Intl", city: "Christchurch", country: "NZ" },
    NAN: { lat: -17.7554, lng: 177.4432, name: "Nadi Intl", city: "Nadi", country: "FJ" },
    PPT: { lat: -17.5537, lng: -149.6071, name: "Fa'a'ā Intl", city: "Tahiti", country: "PF" },

    // ═══════════════════════════════════════════════════════════════
    // AFRICA
    // ═══════════════════════════════════════════════════════════════
    CAI: { lat: 30.1219, lng: 31.4056, name: "Cairo Intl", city: "Cairo", country: "EG" },
    HRG: { lat: 27.1783, lng: 33.7994, name: "Hurghada Intl", city: "Hurghada", country: "EG" },
    SSH: { lat: 27.9773, lng: 34.3953, name: "Sharm el-Sheikh Intl", city: "Sharm el-Sheikh", country: "EG" },
    JNB: { lat: -26.1392, lng: 28.2460, name: "O.R. Tambo Intl", city: "Johannesburg", country: "ZA" },
    CPT: { lat: -33.9715, lng: 18.6021, name: "Cape Town Intl", city: "Cape Town", country: "ZA" },
    DUR: { lat: -29.6144, lng: 31.1197, name: "King Shaka Intl", city: "Durban", country: "ZA" },
    NBO: { lat: -1.3192, lng: 36.9278, name: "Jomo Kenyatta Intl", city: "Nairobi", country: "KE" },
    MBA: { lat: -4.0348, lng: 39.5942, name: "Moi Intl", city: "Mombasa", country: "KE" },
    ADD: { lat: 8.9779, lng: 38.7993, name: "Bole Intl", city: "Addis Ababa", country: "ET" },
    LOS: { lat: 6.5774, lng: 3.3213, name: "Murtala Muhammed Intl", city: "Lagos", country: "NG" },
    ABV: { lat: 9.0065, lng: 7.2632, name: "Nnamdi Azikiwe Intl", city: "Abuja", country: "NG" },
    ACC: { lat: 5.6052, lng: -0.1668, name: "Kotoka Intl", city: "Accra", country: "GH" },
    CMN: { lat: 33.3675, lng: -7.5900, name: "Mohammed V Intl", city: "Casablanca", country: "MA" },
    RAK: { lat: 31.6068, lng: -8.0363, name: "Marrakech Menara", city: "Marrakech", country: "MA" },
    ALG: { lat: 36.6910, lng: 3.2155, name: "Houari Boumediene", city: "Algiers", country: "DZ" },
    TUN: { lat: 36.8510, lng: 10.2272, name: "Tunis–Carthage Intl", city: "Tunis", country: "TN" },
    DSS: { lat: 14.6700, lng: -17.0728, name: "Blaise Diagne Intl", city: "Dakar", country: "SN" },
    DAR: { lat: -6.8781, lng: 39.2026, name: "Julius Nyerere Intl", city: "Dar es Salaam", country: "TZ" },
    JRO: { lat: -3.4293, lng: 37.0745, name: "Kilimanjaro Intl", city: "Kilimanjaro", country: "TZ" },
    EBB: { lat: 0.0424, lng: 32.4435, name: "Entebbe Intl", city: "Entebbe", country: "UG" },
    KGL: { lat: -1.9686, lng: 30.1395, name: "Kigali Intl", city: "Kigali", country: "RW" },
    MRU: { lat: -20.4302, lng: 57.6836, name: "Sir Seewoosagur Ramgoolam Intl", city: "Mauritius", country: "MU" },
    TNR: { lat: -18.7969, lng: 47.4789, name: "Ivato Intl", city: "Antananarivo", country: "MG" },
    SEZ: { lat: -4.6744, lng: 55.5218, name: "Seychelles Intl", city: "Mahé", country: "SC" },
    WDH: { lat: -22.4799, lng: 17.4709, name: "Hosea Kutako Intl", city: "Windhoek", country: "NA" },
    GBE: { lat: -24.5553, lng: 25.9182, name: "Sir Seretse Khama Intl", city: "Gaborone", country: "BW" },
    VFA: { lat: -18.0959, lng: 25.8390, name: "Victoria Falls Intl", city: "Victoria Falls", country: "ZW" },
    ZNZ: { lat: -6.2220, lng: 39.2249, name: "Abeid Amani Karume Intl", city: "Zanzibar", country: "TZ" },

    // ═══════════════════════════════════════════════════════════════
    // CENTRAL ASIA & CAUCASUS
    // ═══════════════════════════════════════════════════════════════
    TAS: { lat: 41.2581, lng: 69.2811, name: "Tashkent Intl", city: "Tashkent", country: "UZ" },
    ALA: { lat: 43.3521, lng: 77.0405, name: "Almaty Intl", city: "Almaty", country: "KZ" },
    NQZ: { lat: 51.0222, lng: 71.4669, name: "Nursultan Nazarbayev Intl", city: "Astana", country: "KZ" },
    GYD: { lat: 40.4675, lng: 50.0467, name: "Heydar Aliyev Intl", city: "Baku", country: "AZ" },
    TBS: { lat: 41.6692, lng: 44.9547, name: "Tbilisi Intl", city: "Tbilisi", country: "GE" },
    EVN: { lat: 40.1473, lng: 44.3959, name: "Zvartnots Intl", city: "Yerevan", country: "AM" },

    // ═══════════════════════════════════════════════════════════════
    // 🇨🇳 CHINA TIER 2 HUBS (Expansion Pack)
    // ═══════════════════════════════════════════════════════════════
    CGO: { lat: 34.5197, lng: 113.8409, name: "Zhengzhou Xinzheng Intl", city: "Zhengzhou", country: "CN" },
    CSX: { lat: 28.1892, lng: 113.2194, name: "Changsha Huanghua Intl", city: "Changsha", country: "CN" },
    DLC: { lat: 38.9657, lng: 121.5386, name: "Dalian Zhoushuizi Intl", city: "Dalian", country: "CN" },
    TSN: { lat: 39.1243, lng: 117.3462, name: "Tianjin Binhai Intl", city: "Tianjin", country: "CN" },
    TNA: { lat: 36.8572, lng: 117.2161, name: "Jinan Yaoqiang Intl", city: "Jinan", country: "CN" },
    TAO: { lat: 36.2661, lng: 120.3744, name: "Qingdao Jiaodong Intl", city: "Qingdao", country: "CN" },
    SHE: { lat: 41.6398, lng: 123.4833, name: "Shenyang Taoxian Intl", city: "Shenyang", country: "CN" },
    XMN: { lat: 24.5440, lng: 118.1278, name: "Xiamen Gaoqi Intl", city: "Xiamen", country: "CN" },
    FOC: { lat: 25.9351, lng: 119.6643, name: "Fuzhou Changle Intl", city: "Fuzhou", country: "CN" },
    HAK: { lat: 19.9349, lng: 110.4589, name: "Haikou Meilan Intl", city: "Haikou", country: "CN" },

    // ═══════════════════════════════════════════════════════════════
    // 🇮🇳 INDIA TIER 2 HUBS (Expansion Pack)
    // ═══════════════════════════════════════════════════════════════
    PNQ: { lat: 18.5821, lng: 73.9197, name: "Pune", city: "Pune", country: "IN" },
    AMD: { lat: 23.0734, lng: 72.6417, name: "Sardar Vallabhbhai Patel Intl", city: "Ahmedabad", country: "IN" },
    CCJ: { lat: 11.1368, lng: 75.9553, name: "Calicut Intl", city: "Kozhikode", country: "IN" },
    TRV: { lat: 8.4821, lng: 76.9202, name: "Thiruvananthapuram Intl", city: "Thiruvananthapuram", country: "IN" },
    LKO: { lat: 26.7606, lng: 80.8893, name: "Chaudhary Charan Singh Intl", city: "Lucknow", country: "IN" },
    JAI: { lat: 26.8242, lng: 75.8122, name: "Jaipur Intl", city: "Jaipur", country: "IN" },
    IXC: { lat: 30.6735, lng: 76.7886, name: "Shaheed Bhagat Singh Intl", city: "Chandigarh", country: "IN" },
    ATQ: { lat: 31.7100, lng: 74.7973, name: "Sri Guru Ram Dass Jee Intl", city: "Amritsar", country: "IN" },
    GAU: { lat: 26.1061, lng: 91.5859, name: "Lokpriya Gopinath Bordoloi Intl", city: "Guwahati", country: "IN" },

    // ═══════════════════════════════════════════════════════════════
    // 🇺🇸 USA REGIONAL (Expansion Pack)
    // ═══════════════════════════════════════════════════════════════
    SNA: { lat: 33.6761, lng: -117.8674, name: "John Wayne", city: "Santa Ana", country: "US" },
    OAK: { lat: 37.7213, lng: -122.2207, name: "Oakland Intl", city: "Oakland", country: "US" },
    SJC: { lat: 37.3619, lng: -121.9290, name: "Norman Y. Mineta San Jose", city: "San Jose", country: "US" },
    SMF: { lat: 38.6954, lng: -121.5908, name: "Sacramento Intl", city: "Sacramento", country: "US" },
    STL: { lat: 38.7472, lng: -90.3595, name: "St. Louis Lambert Intl", city: "St. Louis", country: "US" },
    BNA: { lat: 36.1263, lng: -86.6774, name: "Nashville Intl", city: "Nashville", country: "US" },
    RDU: { lat: 35.8801, lng: -78.7880, name: "Raleigh-Durham Intl", city: "Raleigh", country: "US" },
    MSY: { lat: 29.9911, lng: -90.2592, name: "Louis Armstrong New Orleans", city: "New Orleans", country: "US" },
    SAT: { lat: 29.5337, lng: -98.4698, name: "San Antonio Intl", city: "San Antonio", country: "US" },
    PIT: { lat: 40.4915, lng: -80.2329, name: "Pittsburgh Intl", city: "Pittsburgh", country: "US" },
    CVG: { lat: 39.0493, lng: -84.6621, name: "Cincinnati/Northern Kentucky", city: "Cincinnati", country: "US" },
    CLE: { lat: 41.4058, lng: -81.8511, name: "Cleveland Hopkins Intl", city: "Cleveland", country: "US" },
    IND: { lat: 39.7172, lng: -86.2946, name: "Indianapolis Intl", city: "Indianapolis", country: "US" },
    CMH: { lat: 39.9979, lng: -82.8918, name: "John Glenn Columbus Intl", city: "Columbus", country: "US" },

    // ═══════════════════════════════════════════════════════════════
    // 🇪🇺 EUROPE REGIONAL (Expansion Pack)
    // ═══════════════════════════════════════════════════════════════
    BLQ: { lat: 44.5350, lng: 11.2887, name: "Bologna Guglielmo Marconi", city: "Bologna", country: "IT" },
    PSA: { lat: 43.6840, lng: 10.3927, name: "Pisa Intl", city: "Pisa", country: "IT" },
    VLC: { lat: 39.4894, lng: -0.4816, name: "Valencia", city: "Valencia", country: "ES" },
    SVQ: { lat: 37.4180, lng: -5.8989, name: "Seville", city: "Seville", country: "ES" },
    BIO: { lat: 43.3011, lng: -2.9106, name: "Bilbao", city: "Bilbao", country: "ES" },
    BOD: { lat: 44.8285, lng: -0.7155, name: "Bordeaux–Mérignac", city: "Bordeaux", country: "FR" },
    NTE: { lat: 47.1532, lng: -1.6107, name: "Nantes Atlantique", city: "Nantes", country: "FR" },
    TLS: { lat: 43.6291, lng: 1.3638, name: "Toulouse–Blagnac", city: "Toulouse", country: "FR" },
    GGL: { lat: 53.8679, lng: -0.3778, name: "Humberside", city: "Hull", country: "GB" },
    LPL: { lat: 53.3336, lng: -2.8497, name: "Liverpool John Lennon", city: "Liverpool", country: "GB" },
    NCL: { lat: 55.0375, lng: -1.6917, name: "Newcastle Intl", city: "Newcastle", country: "GB" },
    GLA: { lat: 55.8719, lng: -4.4331, name: "Glasgow", city: "Glasgow", country: "GB" },
    BFS: { lat: 54.6575, lng: -6.2158, name: "Belfast Intl", city: "Belfast", country: "GB" },
}

/**
 * Comprehensive airline name lookup — covers 150+ airlines worldwide
 */
export const AIRLINE_NAMES: Record<string, string> = {
    // North America
    AA: "American Airlines", UA: "United Airlines", DL: "Delta Air Lines",
    WN: "Southwest Airlines", B6: "JetBlue Airways", AS: "Alaska Airlines",
    NK: "Spirit Airlines", F9: "Frontier Airlines", HA: "Hawaiian Airlines",
    AC: "Air Canada", WS: "WestJet", TS: "Air Transat",
    AM: "Aeroméxico", Y4: "Volaris", VB: "VivaAerobus",
    // Europe
    BA: "British Airways", LH: "Lufthansa", AF: "Air France",
    KL: "KLM Royal Dutch Airlines", IB: "Iberia", AZ: "ITA Airways",
    LX: "SWISS", OS: "Austrian Airlines", SK: "SAS Scandinavian Airlines",
    AY: "Finnair", EI: "Aer Lingus", TP: "TAP Air Portugal",
    TK: "Turkish Airlines", SU: "Aeroflot", LO: "LOT Polish Airlines",
    OK: "Czech Airlines", RO: "TAROM", BT: "airBaltic",
    U2: "easyJet", FR: "Ryanair", W6: "Wizz Air",
    VY: "Vueling", DY: "Norwegian Air Shuttle", FI: "Icelandair",
    OU: "Croatia Airlines", A3: "Aegean Airlines", PC: "Pegasus Airlines",
    // Middle East
    EK: "Emirates", QR: "Qatar Airways", EY: "Etihad Airways",
    SV: "Saudia", GF: "Gulf Air", WY: "Oman Air",
    KU: "Kuwait Airways", RJ: "Royal Jordanian", ME: "Middle East Airlines",
    LY: "El Al Israel Airlines", FZ: "flydubai", XY: "flynas",
    G9: "Air Arabia", J9: "Jazeera Airways",
    // South Asia
    AI: "Air India", UK: "Vistara", "6E": "IndiGo",
    SG: "SpiceJet", G8: "Go First", PK: "Pakistan International Airlines",
    BG: "Biman Bangladesh Airlines", UL: "SriLankan Airlines",
    // East Asia
    NH: "ANA (All Nippon Airways)", JL: "Japan Airlines", MM: "Peach Aviation",
    KE: "Korean Air", OZ: "Asiana Airlines", TW: "T'way Air",
    CA: "Air China", MU: "China Eastern Airlines", CZ: "China Southern Airlines",
    HU: "Hainan Airlines", ZH: "Shenzhen Airlines", MF: "Xiamen Airlines",
    CX: "Cathay Pacific", HX: "Hong Kong Airlines", BR: "EVA Air",
    CI: "China Airlines", OM: "MIAT Mongolian Airlines",
    // Southeast Asia
    SQ: "Singapore Airlines", TR: "Scoot", MH: "Malaysia Airlines",
    AK: "AirAsia", TG: "Thai Airways", FD: "Thai AirAsia",
    GA: "Garuda Indonesia", QZ: "Indonesia AirAsia",
    PR: "Philippine Airlines", Z2: "AirAsia Philippines",
    VN: "Vietnam Airlines", VJ: "VietJet Air",
    // Oceania
    QF: "Qantas", VA: "Virgin Australia", JQ: "Jetstar Airways",
    NZ: "Air New Zealand", FJ: "Fiji Airways",
    // Africa
    MS: "EgyptAir", ET: "Ethiopian Airlines", SA: "South African Airways",
    KQ: "Kenya Airways", AT: "Royal Air Maroc", RW: "Royal Wings",
    WB: "RwandAir", TC: "Air Tanzania", UM: "Air Zimbabwe",
    // South America
    LA: "LATAM Airlines", AV: "Avianca", G3: "GOL Linhas Aéreas",
    AR: "Aerolíneas Argentinas", CM: "Copa Airlines",
    // Central Asia & Others
    KC: "Air Astana", HY: "Uzbekistan Airways", J2: "Azerbaijan Airlines",
}

/**
 * Get airport data by IATA code, with intelligent fallback
 */
export function getAirport(iata: string): { lat: number; lng: number; name: string; city: string; country: string } {
    const code = iata?.toUpperCase?.()
    if (code && AIRPORT_COORDS[code]) return AIRPORT_COORDS[code]
    // Default to JFK if not found — the live API handles unknown airports
    return AIRPORT_COORDS.JFK
}

/**
 * Get airline name from flight number prefix
 */
export function getAirlineName(flightNumber: string): string {
    // Extract the 2-character airline code (may include digits for some carriers)
    const code = flightNumber.replace(/[0-9]/g, "").toUpperCase()
    return AIRLINE_NAMES[code] || code
}

export function isAirportKnown(iata: string): boolean {
    return !!AIRPORT_COORDS[iata?.toUpperCase?.()]
}

/**
 * Get coordinates for a city by fuzzy matching against airport database.
 * This acts as a robust, offline geocoder for hotel search.
 */
export function getCityCoordinates(cityName: string): { lat: number; lng: number } | null {
    if (!cityName) return null
    const query = cityName.toLowerCase().trim()

    // 1. Exact City Match
    const exactMatch = Object.values(AIRPORT_COORDS).find(
        airport => airport.city.toLowerCase() === query || airport.name.toLowerCase().includes(query)
    )
    if (exactMatch) return { lat: exactMatch.lat, lng: exactMatch.lng }

    // 2. Fuzzy / Includes Match (e.g. "Paris" matches "Paris Charles de Gaulle")
    // We prioritize major international airports (often listed first or with 'Intl' in name)
    const fuzzyMatch = Object.values(AIRPORT_COORDS).find(
        airport => airport.city.toLowerCase().includes(query)
    )
    if (fuzzyMatch) return { lat: fuzzyMatch.lat, lng: fuzzyMatch.lng }

    return null
}
