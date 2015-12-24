var minSlide = 1;
var maxSlide = 13;

module.exports = function(slide, direction){
	if(direction === 'next' && slide !== maxSlide){
		slide += 1;
	}
	else if(direction === 'prev' && slide !== minSlide){
		slide -= 1;
	}

	return slide;
};