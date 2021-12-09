import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { InternSet } from 'd3';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {
    data = [
        { "letter": "A", "frequency": 0.08167 },
        { "letter": "B", "frequency": 0.01492 },
        { "letter": "C", "frequency": 0.02782 },
        { "letter": "D", "frequency": 0.04253 },
        { "letter": "E", "frequency": 0.12702 },
        { "letter": "F", "frequency": 0.02288 },
        { "letter": "G", "frequency": 0.02015 },
        { "letter": "H", "frequency": 0.06094 },
        { "letter": "I", "frequency": 0.06966 },
        { "letter": "J", "frequency": 0.00153 },
        { "letter": "K", "frequency": 0.00772 },
        { "letter": "L", "frequency": 0.04025 },
        { "letter": "M", "frequency": 0.02406 },
        { "letter": "N", "frequency": 0.06749 },
        { "letter": "O", "frequency": 0.07507 },
        { "letter": "P", "frequency": 0.01929 },
        { "letter": "Q", "frequency": 0.00095 },
        { "letter": "R", "frequency": 0.05987 },
        { "letter": "S", "frequency": 0.06327 },
        { "letter": "T", "frequency": 0.09056 },
        { "letter": "U", "frequency": 0.02758 },
        { "letter": "V", "frequency": 0.00978 },
        { "letter": "W", "frequency": 0.0236 },
        { "letter": "X", "frequency": 0.0015 },
        { "letter": "Y", "frequency": 0.01974 },
        { "letter": "Z", "frequency": 0.00074 }];

    width = 640;
    height = 400;
    margin = 30;

    title: any;
    svg: any;
    bar: any;
    x: any;
    y: any;
    xAxis: any;
    yAxis: any;
    xDomain: any;
    xRange = [this.margin, this.width - this.margin];
    yType = d3.scaleLinear;
    yDomain: any;
    yRange = [this.height - this.margin, this.margin];
    xPadding = .1;
    yLabel: any;
    color = 'steelBlue';
    yFormat: any;


    constructor() { }

    ngOnInit(): void {
        this.yLabel = '↑ Frequency'
        this.xDomain = d3.groupSort(this.data, ([d]) => -d.frequency, d => d.letter);
        this.barChart();
    }

    barChart() {
        const X = d3.map(this.data, d => d.letter);
        const Y = d3.map(this.data, d => d.frequency);

        if (this.xDomain === undefined) this.xDomain = X;
        if (this.yDomain === undefined) this.yDomain = [0, d3.max(Y)];
        this.xDomain = new InternSet(this.xDomain);

        const I = d3.range(X.length).filter(i => this.xDomain.has(X[i]));

        const xScale = d3.scaleBand()
            .range(this.xRange)
            .domain(this.xDomain)
            .padding(this.xPadding);

        const yScale = d3.scaleLinear()
            .range(this.yRange)
            .domain(this.yDomain);

        this.xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
        this.yAxis = d3.axisLeft(yScale).ticks(this.height / 40, this.yFormat);

        if (this.title === undefined) {
            const formatValue = yScale.tickFormat(100, this.yFormat);
            this.title = ((i: any) => `${X[i]}\n${formatValue(Y[i])}`);
        } else {
            const O = d3.map(this.data, d => d);
            const T = this.title;
            this.title = (i: any) => T(O[i], i, this.data);
        }

        this.svg = d3.select('div')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `[0,0,${this.width},${this.height}`)
            .attr('style', 'max-width : 100%; height:auto; height:intrinsic');

        this.svg.append('g')
            .attr('transform', `translate(${this.margin},0)`)
            .call(this.yAxis)
            .call((g: any) => g.select('.domain').remove())
            .call((g: any) => g.selectAll('.tick line').clone()
                .attr('x2', this.width - this.margin * 2)
                .attr('stroke-opacity', .1)
            )
            .call((g: any) => g.append('text')
                .attr('x', -this.margin)
                .attr('y', 10)
                .attr('fill', 'currentColor')
                .attr("text-anchor", 'start')
                .text(this.yLabel));

        this.bar = this.svg.append('g')
            .attr('class', 'bars')
            .attr('fill', this.color)
            .selectAll('rect')
            .data(I)
            .join('rect')
            .attr('x', (i: any) => xScale(X[i]))
            .attr('y', (i: any) => yScale(Y[i]))
            .attr('height', (i: any) => yScale(0) - yScale(Y[i]))
            .attr('width', xScale.bandwidth())


        this.svg.append('g')
            .attr('transform', `translate(0,${this.height - this.margin})`)
            .call(this.xAxis);

    }




}
