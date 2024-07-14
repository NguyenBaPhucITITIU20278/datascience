d3.csv('https://raw.githubusercontent.com/ttdat1712/Project/main/Project.csv').then(function(rawData) {
    let data = rawData;
    let selectedCountries = [];
    let sortAscending = true;
    let currentPage = 1;
    const itemsPerPage = 20; // Number of items to display per page

    data.forEach(function(d) {
        d['Infected case'] = +d['Infected case'].replace(/\D/g, '');
        d['Death case'] = +d['Death case'];
    });

    var uniqueCountries = Array.from(new Set(data.map(d => d.Country)));

    var selectCountryBtn = d3.select('#selectCountryBtn');
    var countryDropdown = d3.select('#countryDropdown');
    countryDropdown
        .selectAll('option')
        .data(uniqueCountries)
        .enter()
        .append('option')
        .text(d => d);

    var chartActionBtn = d3.select('#chartActionBtn');
    var sortBtn = d3.select('#sortBtn');
    var prevPageBtn = d3.select('#prevPageBtn');
    var nextPageBtn = d3.select('#nextPageBtn');
    var svg = d3.select('#chart');
    var margin = { top: 20, right: 40, bottom: 50, left: 150 };
    var width = 800 - margin.left - margin.right;
    var height = 530 - margin.top - margin.bottom;
    var tooltip = d3.select('#tooltip');
    
    // Thêm sự kiện click cho nút Remove All
    var removeAllBtn = d3.select('#removeAllBtn');
    removeAllBtn.on('click', function () {
    // Xóa tất cả các nước đã chọn
    selectedCountries = [];
    // Cập nhật biểu đồ
updateChart();
updateButtonText();
});
    chartActionBtn.on('click', function () {
        var selectedCountry = countryDropdown.property('value');
        if (selectedCountry) {
            var isInChart = selectedCountries.includes(selectedCountry);

            if (isInChart) {
                console.log('Remove from Chart - Selected Country:', selectedCountry);
                selectedCountries = selectedCountries.filter(country => country !== selectedCountry);
            } else {
                console.log('Add to Chart - Selected Country:', selectedCountry);
                selectedCountries.push(selectedCountry);
            }

            updateChart();
            updateButtonText();
        }
    });

    function updateButtonText() {
        var selectedCountry = countryDropdown.property('value');
            if (selectedCountry) {
        var isInChart = selectedCountries.includes(selectedCountry);
        var buttonText = isInChart ? 'Remove from chart' : 'Add to chart';
        chartActionBtn.text(buttonText);
            } else {
        chartActionBtn.text('Add to chart');
    }
}

    countryDropdown.on('change', updateButtonText);

    sortBtn.on('click', function () {
        sortAscending = !sortAscending;
        var buttonText = sortAscending ? 'Sort by Ascending' : 'Sort by Descending';
        sortBtn.text(buttonText);
        updateChart();
    });
    var isChartEmpty = true;
    var isAnyCountryAdded = false;

    prevPageBtn.on('click', function () {
        if (currentPage > 1) {
            currentPage--;
            updateChart();
        }
    });

    nextPageBtn.on('click', function () {
        var maxPage = Math.ceil(selectedCountries.length / itemsPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            updateChart();
        }
    });


    function updateChart() {
        svg.selectAll('*').remove();
        isAnyCountryAdded = true; 
        isChartEmpty = false; 
        var chart = svg
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var startIndex = (currentPage - 1) * itemsPerPage;
        var endIndex = startIndex + itemsPerPage;
        var filteredData = data.filter(d => selectedCountries.includes(d.Country));
        if (filteredData.length > 0) {
            isChartEmpty = false; 
            filteredData.sort((a, b) => {
                return sortAscending ? d3.ascending(a['Infected case'], b['Infected case']) : d3.descending(a['Infected case'], b['Infected case']);
            });

            var x = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d['Infected case'])])  
                    .range([0, width]);

            var y = d3.scaleBand()
                .domain(filteredData.slice(startIndex, endIndex).map(d => d.Country))
                .range([height, 0])
                .padding(0.1);
                
                

            chart.selectAll('.bar')
                .data(filteredData.slice(startIndex, endIndex))
                .enter().append('rect')
                .attr('class', 'bar')
                .attr('x', 0)
                .attr('y', d => y(d.Country) + (y.bandwidth() - 0.2* y.bandwidth()) / 2)
                .attr('width', d => Math.max(x(d['Infected case']), 9))
                .attr('height', 0.2*y.bandwidth())
                .attr('fill', 'steelblue')
                

                
                .on('mouseover', function(d) {
                    tooltip.html(`<strong>Country:</strong> ${d.Country}<br><strong>Infected Cases:</strong> ${d['Infected case']}<br><strong>Death Cases:</strong> ${d['Death case']}`)
                        .style('display', 'block')
                        .style('left', d3.event.pageX + 10 + 'px')
                        .style('top', d3.event.pageY - 10 + 'px')
                        .classed('custom-tooltip-class', true);
                })
                .on('mouseout', function() {
                    tooltip.style('display', 'none');
                });
                var yLabels = chart.append('g')

            chart.selectAll('.bar-label')
                .data(filteredData.slice(startIndex, endIndex))
                .enter().append('text')
                .attr('class', 'bar-label')
                .attr('x', d => x(d['Infected case']) + 5)  // Dịch vị trí x 5px để tránh trùng với thanh bar
                .attr('y', d => y(d.Country) + y.bandwidth() / 2)
                .attr('dy', '0.35em')
                .style('font-size', '20px')
                .text(d => d['Infected case']);
    
            chart.append('text')
                .attr('class', 'y-axis-label')
                .attr('x', -height / 2)
                .attr('y', -margin.left +35)
                .attr('dy', '1em')
                .attr('transform', 'rotate(-90)')
                .attr('text-anchor', 'middle')
                .text('Country')
                .style('font-weight', 'bold');

            chart.append('text')
                .attr('class', 'x-label')
                .attr('x', width / 2)
                .attr('y', height + margin.bottom)
                .attr('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Infected Cases');

            chart.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .call(d3.axisBottom(x));

            chart.append('g')
                .call(d3.axisLeft(y));
            } else {
            isAnyCountryAdded = false; 
            isChartEmpty = true;
            console.log('No countries selected');
        }
        updateChartTitle();
        updateButtonText();
        
    }
    function updateChartTitle() {
        var chartTitle = isAnyCountryAdded && !isChartEmpty ? 'Number of COVID-19 Cases in Vietnam' : '';

        d3.select('#chartTitle')
        .text(chartTitle)
        .style('display', isAnyCountryAdded && !isChartEmpty ? 'block' : 'none');
}
// Thêm sự kiện click cho dropdown Option
var optionDropdown = d3.select('#optionDropdown');
optionDropdown.on('click', function () {
d3.event.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài dropdown
var optionsList = d3.select('.custom-options');
optionsList.classed('active', !optionsList.classed('active')); // Hiển thị/ẩn danh sách chức năng
});

// Thêm sự kiện click cho từng chức năng trong dropdown Option
d3.selectAll('.custom-options div[data-option]').on('click', function () {
var option = d3.select(this).attr('data-option');
switch (option) {
    case 'least-infected':
        addLeastInfectedProvinces();
        break;
    case 'most-infected':
        addMostInfectedProvinces();
        break;
    case 'random':
        addRandomProvinces();
        break;
    default:
        break;
}

d3.select('.custom-options').classed('active', false);
});
function addLeastInfectedProvinces() {
data.sort((a, b) => d3.ascending(a['Infected case'], b['Infected case']));
var leastInfectedProvinces = data.slice(0, 10);
selectedCountries = leastInfectedProvinces.map(province => province.Country);
updateChart();
updateButtonText();
}
function addMostInfectedProvinces() {
data.sort((a, b) => d3.descending(a['Infected case'], b['Infected case']));
var mostInfectedProvinces = data.slice(0, 10);
selectedCountries = mostInfectedProvinces.map(province => province.Country);
updateChart();
updateButtonText();
}
function addRandomProvinces() {
var randomProvinces = shuffleArray(data).slice(0, 10);
selectedCountries = randomProvinces.map(province => province.Country);
updateChart();
updateButtonText();
}
function shuffleArray(array) {
var currentIndex = array.length, randomIndex;
while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
}
return array;
}
});