// ADS
// ========

longToByteArray = function(/*long*/long) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for ( var index = 0; index < byteArray.length; index ++ ) {
        var byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }

    return byteArray;
};


var i2c = require('i2c');
var sleep = require('sleep');

defaults = {
	device							: '/dev/i2c-1',
	address           			    : (0x48), //(0x48);  // 1001 000 (ADDR = GND)
	ic 								: 'ADS1015',
	gain 							: 6144,
	debug							: false,
	pga 							: false,


	// IC Identifiers
	IC_ADS1015                      : 0x00,
	IC_ADS1115                      : 0x01,

	// Pointer Register
	ADS1015_REG_POINTER_MASK        : 0x03,
	ADS1015_REG_POINTER_CONVERT     : 0x00,
	ADS1015_REG_POINTER_CONFIG      : 0x01,
	ADS1015_REG_POINTER_LOWTHRESH   : 0x02,
	ADS1015_REG_POINTER_HITHRESH    : 0x03,

	// Config Register
	ADS1015_REG_CONFIG_OS_MASK      : 0x8000,
	ADS1015_REG_CONFIG_OS_SINGLE    : 0x8000,  // Write: Set to start a single-conversion
	ADS1015_REG_CONFIG_OS_BUSY      : 0x0000,  // Read: Bit = 0 when conversion is in progress
	ADS1015_REG_CONFIG_OS_NOTBUSY   : 0x8000,  // Read: Bit = 1 when device is not performing a conversion

	ADS1015_REG_CONFIG_MUX_MASK     : 0x7000,
	ADS1015_REG_CONFIG_MUX_DIFF_0_1 : 0x0000,  // Differential P = AIN0, N = AIN1 (default)
	ADS1015_REG_CONFIG_MUX_DIFF_0_3 : 0x1000,  // Differential P = AIN0, N = AIN3
	ADS1015_REG_CONFIG_MUX_DIFF_1_3 : 0x2000,  // Differential P = AIN1, N = AIN3
	ADS1015_REG_CONFIG_MUX_DIFF_2_3 : 0x3000,  // Differential P = AIN2, N = AIN3
	ADS1015_REG_CONFIG_MUX_SINGLE_0 : 0x4000,  // Single-ended AIN0
	ADS1015_REG_CONFIG_MUX_SINGLE_1 : 0x5000,  // Single-ended AIN1
	ADS1015_REG_CONFIG_MUX_SINGLE_2 : 0x6000,  // Single-ended AIN2
	ADS1015_REG_CONFIG_MUX_SINGLE_3 : 0x7000,  // Single-ended AIN3

	ADS1015_REG_CONFIG_PGA_MASK     : 0x0E00,
	ADS1015_REG_CONFIG_PGA_6_144V   : 0x0000,  // +/-6.144V range
	ADS1015_REG_CONFIG_PGA_4_096V   : 0x0200,  // +/-4.096V range
	ADS1015_REG_CONFIG_PGA_2_048V   : 0x0400,  // +/-2.048V range (default)
	ADS1015_REG_CONFIG_PGA_1_024V   : 0x0600,  // +/-1.024V range
	ADS1015_REG_CONFIG_PGA_0_512V   : 0x0800,  // +/-0.512V range
	ADS1015_REG_CONFIG_PGA_0_256V   : 0x0A00,  // +/-0.256V range

	ADS1015_REG_CONFIG_MODE_MASK    : 0x0100,
	ADS1015_REG_CONFIG_MODE_CONTIN  : 0x0000,  // Continuous conversion mode
	ADS1015_REG_CONFIG_MODE_SINGLE  : 0x0100,  // Power-down single-shot mode (default)

	ADS1015_REG_CONFIG_DR_MASK      : 0x00E0,  
	ADS1015_REG_CONFIG_DR_128SPS    : 0x0000,  // 128 samples per second
	ADS1015_REG_CONFIG_DR_250SPS    : 0x0020,  // 250 samples per second
	ADS1015_REG_CONFIG_DR_490SPS    : 0x0040,  // 490 samples per second
	ADS1015_REG_CONFIG_DR_920SPS    : 0x0060,  // 920 samples per second
	ADS1015_REG_CONFIG_DR_1600SPS   : 0x0080,  // 1600 samples per second (default)
	ADS1015_REG_CONFIG_DR_2400SPS   : 0x00A0,  // 2400 samples per second
	ADS1015_REG_CONFIG_DR_3300SPS   : 0x00C0,  // 3300 samples per second (also 0x00E0)

	ADS1115_REG_CONFIG_DR_8SPS      : 0x0000,  // 8 samples per second
	ADS1115_REG_CONFIG_DR_16SPS     : 0x0020,  // 16 samples per second
	ADS1115_REG_CONFIG_DR_32SPS     : 0x0040,  // 32 samples per second
	ADS1115_REG_CONFIG_DR_64SPS     : 0x0060,  // 64 samples per second
	ADS1115_REG_CONFIG_DR_128SPS    : 0x0080,  // 128 samples per second
	ADS1115_REG_CONFIG_DR_250SPS    : 0x00A0,  // 250 samples per second (default)
	ADS1115_REG_CONFIG_DR_475SPS    : 0x00C0,  // 475 samples per second
	ADS1115_REG_CONFIG_DR_860SPS    : 0x00E0,  // 860 samples per second

	ADS1015_REG_CONFIG_CMODE_MASK   : 0x0010,
	ADS1015_REG_CONFIG_CMODE_TRAD   : 0x0000,  // Traditional comparator with hysteresis (default)
	ADS1015_REG_CONFIG_CMODE_WINDOW : 0x0010,  // Window comparator

	ADS1015_REG_CONFIG_CPOL_MASK    : 0x0008,
	ADS1015_REG_CONFIG_CPOL_ACTVLOW : 0x0000,  // ALERT/RDY pin is low when active (default)
	ADS1015_REG_CONFIG_CPOL_ACTVHI  : 0x0008,  // ALERT/RDY pin is high when active

	ADS1015_REG_CONFIG_CLAT_MASK    : 0x0004,  // Determines if ALERT/RDY pin latches once asserted
	ADS1015_REG_CONFIG_CLAT_NONLAT  : 0x0000,  // Non-latching comparator (default)
	ADS1015_REG_CONFIG_CLAT_LATCH   : 0x0004,  // Latching comparator

	ADS1015_REG_CONFIG_CQUE_MASK    : 0x0003,
	ADS1015_REG_CONFIG_CQUE_1CONV   : 0x0000,  // Assert ALERT/RDY after one conversions
	ADS1015_REG_CONFIG_CQUE_2CONV   : 0x0001,  // Assert ALERT/RDY after two conversions
	ADS1015_REG_CONFIG_CQUE_4CONV   : 0x0002,  // Assert ALERT/RDY after four conversions
	ADS1015_REG_CONFIG_CQUE_NONE    : 0x0003,  // Disable the comparator and put ALERT/RDY in high state (default)

}

// Dictionaries with the sampling speed values
// These simplify and clean the code (avoid the abuse of if/elif/else clauses)
defaults.spsADS1115 = {
	8	: defaults.ADS1115_REG_CONFIG_DR_8SPS,
	16	: defaults.ADS1115_REG_CONFIG_DR_16SPS,
	32	: defaults.ADS1115_REG_CONFIG_DR_32SPS,
	64	: defaults.ADS1115_REG_CONFIG_DR_64SPS,
	128	: defaults.ADS1115_REG_CONFIG_DR_128SPS,
	250	: defaults.ADS1115_REG_CONFIG_DR_250SPS,
	475	: defaults.ADS1115_REG_CONFIG_DR_475SPS,
	860	: defaults.ADS1115_REG_CONFIG_DR_860SPS
}

defaults.spsADS1015 = {
	128	: defaults.ADS1015_REG_CONFIG_DR_128SPS,
	250	: defaults.ADS1015_REG_CONFIG_DR_250SPS,
	490	: defaults.ADS1015_REG_CONFIG_DR_490SPS,
	920	: defaults.ADS1015_REG_CONFIG_DR_920SPS,
	1600: defaults.ADS1015_REG_CONFIG_DR_1600SPS,
	2400: defaults.ADS1015_REG_CONFIG_DR_2400SPS,
	3300: defaults.ADS1015_REG_CONFIG_DR_3300SPS
}

//Dictionariy with the programable gains
defaults.pgaADS1x15 = {
	6144: defaults.ADS1015_REG_CONFIG_PGA_6_144V,
	4096: defaults.ADS1015_REG_CONFIG_PGA_4_096V,
	2048: defaults.ADS1015_REG_CONFIG_PGA_2_048V,
	1024: defaults.ADS1015_REG_CONFIG_PGA_1_024V,
	512	: defaults.ADS1015_REG_CONFIG_PGA_0_512V,
	256	: defaults.ADS1015_REG_CONFIG_PGA_0_256V
}



function Adafruit_ADS1X15(ic, address, options){
	if(!ic) throw new Error('ADS type not specified');
	if(ic != 'ADS1015' && ic != 'ADS1115') throw new Error('Invalid ADS ic should be ADS1015 or ADS1115');
	if(!address) throw new Error('ADS Address not specified');

	this.ic = ic;
	this.address = address;

	for (x in options) {
		if(options[x]) this[x] = options[x];
	}

	// Depending on if you have an old or a new Raspberry Pi, you
	// may need to change the I2C bus.  Older Pis use SMBus 0,
	// whereas new Pis use SMBus 1.  If you see an error like:
	// 'Error accessing 0x48: Check your I2C address '
	// change the SMBus number in the initializer below!
	this.i2c = new i2c( this.address, { device: this.device } ); // point to your i2c address
	if(this.ic == 'ADS1015'){
		this.conversionDelay = this.ADS1015_CONVERSIONDELAY;
		this.bitShift = 4;
		this.gain = this.GAIN_TWOTHIRDS; /* +/- 6.144V range (limited to VDD +0.3V max!) */
	} else {
		this.conversionDelay = this.ADS1115_CONVERSIONDELAY;
		this.bitShift = 0;
		this.gain = this.GAIN_TWOTHIRDS; /* +/- 6.144V range (limited to VDD +0.3V max!) */
	}

}

//set up the defaults
for(var i in defaults) { 
	Adafruit_ADS1X15.prototype[i] = defaults[i];
};

Adafruit_ADS1X15.prototype.readADC_SingleEnded = function(channel, pga, sps) {

    /*
	    Gets a single-ended ADC reading from the specified channel in mV. 
	    The sample rate for this mode (single-shot) can be used to lower the noise 
	    (low sps) or to lower the power consumption (high sps) by duty cycling, 
	    see datasheet page 14 for more info. 
	    The pga must be given in mV, see page 13 for the supported values.
	*/
	if (channel > 3){
		throw new Error( 'Invalid Channel selected' );
		return false;
	}
    // Disable comparator, Non-latching, Alert/Rdy active low
    //traditional comparator, single-shot mode
    config = this.ADS1015_REG_CONFIG_CQUE_NONE    | 
             this.ADS1015_REG_CONFIG_CLAT_NONLAT  | 
             this.ADS1015_REG_CONFIG_CPOL_ACTVLOW | 
             this.ADS1015_REG_CONFIG_CMODE_TRAD   | 
             this.ADS1015_REG_CONFIG_MODE_SINGLE    

    // Set sample per seconds, defaults to 250sps
    // If sps is in the dictionary (defined in init) it returns the value of the constant
    // othewise it returns the value for 250sps. This saves a lot of if/elif/else code!
    if ( this.ic == 'ADS1015' ){
		this.sps = ( typeof this.spsADS1015[ sps ] == 'number' )? sps: 250;
		config |= this.spsADS1015[this.sps];
	} else {
		this.sps = ( typeof this.spsADS1115[ sps ] == 'number' )? sps: 250;
		config |= this.spsADS1115[this.sps];
	}

    // Set PGA/voltage range, defaults to +-6.144V
    if ( !this.pgaADS1x15[pga] && this.debug){
		console.log( "ADS1x15: Invalid pga specified: " + sps + ", using 6144mV" );
    }
	this.pga = ( typeof this.pgaADS1x15[ pga ] == 'number' )? pga: 6144;
	config |= this.pgaADS1x15[this.pga];

    // Set the channel to be converted
	switch (channel){
		case (3):
			config |= this.ADS1015_REG_CONFIG_MUX_SINGLE_3;
			break;
		case (2):
			config |= this.ADS1015_REG_CONFIG_MUX_SINGLE_2;
			break;
		case (1):
			config |= this.ADS1015_REG_CONFIG_MUX_SINGLE_1;
			break;
		default:
			config |= this.ADS1015_REG_CONFIG_MUX_SINGLE_0;
	}

    // Set 'start single-conversion' bit
    config |= this.ADS1015_REG_CONFIG_OS_SINGLE;

	//console.log( "Config: ", config );
    // Write config register to the ADC
    bytes = [(config >> 8) & 0xFF, config & 0xFF];
    this.i2c.writeBytes(this.ADS1015_REG_POINTER_CONFIG, bytes, function(err) { if(err)console.log("Error:",err) });

    // Wait for the ADC conversion to complete
    // The minimum delay depends on the sps: delay >= 1/sps
    // We add 0.1ms to be sure
    delay = 1.0 / this.sps + 0.0001;

 	// Wait for the conversion to complete
	sleep.usleep( Math.round( delay * 1000000 ) );   



    // Read the conversion results
    result = this.i2c.readBytes(this.ADS1015_REG_POINTER_CONVERT, 2, function(err, res){return res});

    if ( this.ic == 'ADS1015' ){
    	// Shift right 4 bits for the 12-bit ADS1015 and convert to mV
    	return ( ((result[0] << 8) | (result[1] & 0xFF)) >> 4 )*this.pga/2048.0
    } else {
		// Return a mV value for the ADS1115
		// (Take signed values into account as well)
		val = (result[0] << 8) | (result[1])
		if ( val > 0x7FFF ){
		  return (val - 0xFFFF)*pga/32768.0
		} else {
		  return ( (result[0] << 8) | (result[1]) )*pga/32768.0
		}
	}
}

Adafruit_ADS1X15.prototype.readADCDifferential = function(chP, chN, pga, sps){
    //Gets a differential ADC reading from channels chP and chN in mV. 
    //The sample rate for this mode (single-shot) can be used to lower the noise 
    //(low sps) or to lower the power consumption (high sps) by duty cycling, 
    //see data sheet page 14 for more info. 
    //The pga must be given in mV, see page 13 for the supported values.
    
    // Disable comparator, Non-latching, Alert/Rdy active low
   // traditional comparator, single-shot mode    
    config = this.ADS1015_REG_CONFIG_CQUE_NONE    | 
             this.ADS1015_REG_CONFIG_CLAT_NONLAT  | 
             this.ADS1015_REG_CONFIG_CPOL_ACTVLOW | 
             this.ADS1015_REG_CONFIG_CMODE_TRAD   | 
             this.ADS1015_REG_CONFIG_MODE_SINGLE  
    
	if(!chP) chP = 0;
	if(!chN) chN = 1;

    // Set channels
    if ( (chP == 0) & (chN == 1) ){
      config |= this.ADS1015_REG_CONFIG_MUX_DIFF_0_1;

    } else if ( (chP == 0) & (chN == 3) ){
      config |= this.ADS1015_REG_CONFIG_MUX_DIFF_0_3;

    } else if ( (chP == 2) & (chN == 3) ) {
      config |= this.ADS1015_REG_CONFIG_MUX_DIFF_2_3;

    } else if ( (chP == 1) & (chN == 3) ){
      config |= this.ADS1015_REG_CONFIG_MUX_DIFF_1_3;

    } else{
		if (this.debug){
			console.log( "ADS1x15: Invalid channels specified: " + chP + ", " + chN );
		}
      	return -1;
    }

    // Set sample per seconds, defaults to 250sps
    // If sps is in the dictionary (defined in init) it returns the value of the constant
    // othewise it returns the value for 250sps. This saves a lot of if/elif/else code!
    if ( this.ic == 'ADS1015' ){
		this.sps = ( typeof this.spsADS1015[ sps ] == 'number' )? sps: 250;
		config |= this.spsADS1015[this.sps];
	} else {
		this.sps = ( typeof this.spsADS1115[ sps ] == 'number' )? sps: 250;
		config |= this.spsADS1115[this.sps];
	}

    // Set PGA/voltage range, defaults to +-6.144V
    if ( !this.pgaADS1x15[pga] && this.debug){
		console.log( "ADS1x15: Invalid pga specified: " + sps + ", using 6144mV" );
    }
	this.pga = ( typeof this.pgaADS1x15[ pga ] == 'number' )? pga: 6144;
	config |= this.pgaADS1x15[this.pga];

    // Set 'start single-conversion' bit
    config |= this.ADS1015_REG_CONFIG_OS_SINGLE;

    // Write config register to the ADC
    bytes = [(config >> 8) & 0xFF, config & 0xFF];
    this.i2c.writeBytes(this.ADS1015_REG_POINTER_CONFIG, bytes, function(err) { if(err)console.log("Error:",err) });

    // Wait for the ADC conversion to complete
    // The minimum delay depends on the sps: delay >= 1/sps
    // We add 0.1ms to be sure
    delay = 1.0 / this.sps + 0.0001;
	sleep.usleep( Math.round( delay * 1000000 ) );   

    // Read the conversion results
    result = this.i2c.readBytes(this.ADS1015_REG_POINTER_CONVERT, 2, function(err, res){return res});    
    if (this.ic == this.__IC_ADS1015){
    	// Shift right 4 bits for the 12-bit ADS1015 and convert to mV
    	return ( ((result[0] << 8) | (result[1] & 0xFF)) >> 4 )*pga/2048.0;
    } else {
		// Return a mV value for the ADS1115
		// (Take signed values into account as well)
		val = (result[0] << 8) | (result[1]);
		if ( val > 0x7FFF ) {
		  	return (val - 0xFFFF)*pga/32768.0
		} else {
		  	return ( (result[0] << 8) | (result[1]) )*pga/32768.0;
		}
	}
}

Adafruit_ADS1X15.prototype.readADCDifferential01 = function(pga, sps){
	/* 
		Gets a differential ADC reading from channels 0 and 1 in mV
		The sample rate for this mode (single-shot) can be used to lower the noise 
		(low sps) or to lower the power consumption (high sps) by duty cycling, 
		see data sheet page 14 for more info. 
		The pga must be given in mV, see page 13 for the supported values.
	*/
	if(!pga) pga = 6144;
	if(!sps) sps = 250;
	return this.readADCDifferential(0, 1, pga, sps)
}

Adafruit_ADS1X15.prototype.readADCDifferential03 = function(pga, sps){
	/* 
		Gets a differential ADC reading from channels 0 and 3 in mV
		The sample rate for this mode (single-shot) can be used to lower the noise 
		(low sps) or to lower the power consumption (high sps) by duty cycling, 
		see data sheet page 14 for more info. 
		The pga must be given in mV, see page 13 for the supported values.
	*/
	if(!pga) pga = 6144;
	if(!sps) sps = 250;
	return this.readADCDifferential(0, 3, pga, sps)
}

Adafruit_ADS1X15.prototype.readADCDifferential13 = function(pga, sps){
	/* 
		Gets a differential ADC reading from channels 1 and 3 in mV
		The sample rate for this mode (single-shot) can be used to lower the noise 
		(low sps) or to lower the power consumption (high sps) by duty cycling, 
		see data sheet page 14 for more info. 
		The pga must be given in mV, see page 13 for the supported values.
	*/
	if(!pga) pga = 6144;
	if(!sps) sps = 250;
	return this.readADCDifferential(1, 3, pga, sps)
}

Adafruit_ADS1X15.prototype.readADCDifferential23 = function(pga, sps){
	/* 
		Gets a differential ADC reading from channels 2 and 3 in mV
		The sample rate for this mode (single-shot) can be used to lower the noise 
		(low sps) or to lower the power consumption (high sps) by duty cycling, 
		see data sheet page 14 for more info. 
		The pga must be given in mV, see page 13 for the supported values.
	*/
	if(!pga) pga = 6144;
	if(!sps) sps = 250;
	return this.readADCDifferential(2, 3, pga, sps)
}

Adafruit_ADS1X15.prototype.getLastConversionResults = function(){
	// Returns the last ADC conversion result in mV
	// Read the conversion results
	result = this.i2c.readBytes(this.ADS1015_REG_POINTER_CONVERT, 2, function(err, res){return res});

	if (this.ic == this.__IC_ADS1015){
		// Shift right 4 bits for the 12-bit ADS1015 and convert to mV
		return ( ((result[0] << 8) | (result[1] & 0xFF)) >> 4 )*this.pga/2048.0
	} else {
		// Return a mV value for the ADS1115
		// (Take signed values into account as well)
		val = (result[0] << 8) | (result[1])
		if ( val > 0x7FFF ){
			return (val - 0xFFFF)*this.pga/32768.0
		} else {
			return ( (result[0] << 8) | (result[1]) )*this.pga/32768.0  
		}
	}
}

module.exports = Adafruit_ADS1X15;