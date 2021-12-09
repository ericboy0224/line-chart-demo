import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.scss']
})

export class LineChartComponent implements OnInit {
    title: any;
    data: any[] = [];
    margin = { top: 20, right: 30, bottom: 30, left: 40 };
    width: number = 400;
    height: number = 300;
    x: any;
    y: any;
    xScale: any;
    yScale: any;
    svg: any;
    line: any; // this is line defination
    strokeLinecap = "round"; // stroke line cap of the line
    strokeLinejoin = "round"; // stroke line join of the line
    strokeWidth = 1.5; // stroke width of line; in pixels
    strokeOpacity = 1; // stroke opacity of line
    color: any = 'steelBlue';
    yLabel: any = '↑ Daily close ($)';
    zoom: any;
    xAxis: any;
    yAXis: any;
    clipId: any;
    path: any;
    gx: any;
    @ViewChild('demo')
    demo!: ElementRef;
    tooltip: any;
    yFormat: any;
    formatDate: any;
    formatValue: any;
    O: any;
    T: any;
    toolText: any;
    toolPath: any;
    xz: any;

    constructor(private http: HttpClient) { }

    public ngOnInit(): void { }

    ngAfterViewInit(): void {
        this.http.get('../../assets/aapl.json').subscribe((res) => {
            this.data = Object.values(res);
            this.buildSvg();
        })
    }

    uid() {
        var d = Date.now();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    private buildSvg() {
        this.height = this.demo.nativeElement.clientHeight;
        this.width = this.demo.nativeElement.clientWidth;

        this.zoom = d3.zoom()
            .scaleExtent([1, 36])
            .translateExtent([[this.margin.left, this.margin.top], [this.width - this.margin.right, this.height - this.margin.bottom]])
            .extent([[this.margin.left, this.margin.top], [this.width - this.margin.right, this.height - this.margin.bottom]])
            .on('zoom', this.zoomed.bind(this));

        this.x = d3.map(this.data, d => new Date(d.date));
        this.y = d3.map(this.data, d => d.close);

        // build svg
        this.svg = d3.selectAll('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('style', 'max-width: 100%; height:auto; height: intrinsic')
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .style("-webkit-tap-highlight-color", "transparent")
            .style("overflow", "visible")
            .on("pointerenter pointermove", this.pointermoved.bind(this))
            .on("pointerleave", this.pointerleft.bind(this))
            .on("touchstart", event => event.preventDefault());

        this.clipId = this.uid();

        this.svg.append('clipPath')
            .attr('id', this.clipId)
            .append('rect')
            .attr('x', this.margin.left)
            .attr('y', this.margin.top)
            .attr("width", this.width - this.margin.left - this.margin.right)
            .attr("height", this.height - this.margin.top - this.margin.bottom);

        // Axis
        //config
        this.xScale = d3.scaleUtc()
            .range([this.margin.left, this.width - this.margin.right])
            .domain(<[Date, Date]>d3.extent(this.data, (d: any) => new Date(d.date)));

        this.yScale = d3.scaleLinear()
            .range([this.height - this.margin.bottom, this.margin.top])
            .domain(<[number, number]>d3.extent(this.data, (d: any) => d.close));

        if (this.title === undefined) {
            this.formatDate = this.xScale.tickFormat(null, "%b %-d, %Y");
            this.formatValue = this.yScale.tickFormat(100, this.yFormat);
            this.title = (i: any) => `${this.formatDate(this.x[i])}\n${this.formatValue(this.y[i])}`;
        } else {
            this.O = d3.map(this.data, d => d);
            this.T = this.title;
            this.title = (i: any) => this.T(this.O[i], i, this.data);
        }

        //draw
        // x
        this.xAxis = (g: any, x: any) => g
            .attr('transform', `translate(0, ${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.xScale)
                .ticks(this.width / 80)
                .tickSizeOuter(0));

        this.gx = this.svg.append('g').call(this.xAxis)

        // y
        this.yAXis = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.yScale)
                .ticks(this.height / 40))
            .call((g: any) => g.select(".domain").remove())
            .call((g: any) => g.selectAll('.tick line').clone()
                .attr('x2', this.width - this.margin.right - this.margin.left)
                .attr('stroke-opacity', .1))
            .call((g: any) => g.append('text')
                .attr('x', -this.margin.left)
                .attr('y', 10)
                .attr('fill', this.color)
                .attr('text-anchor', 'start')
                .text(this.yLabel))


        // path
        this.line = d3.line()
            .x((d: any) => {
                return this.xScale(new Date(d.date));
            })
            .y((d: any) => this.yScale(d.close));

        this.path = this.svg.append('path')
            .attr('clip-path', this.clipId)
            .attr('fill', 'none')
            .attr('stroke', 'steelBlue')
            .attr("stroke-width", this.strokeWidth)
            .attr("stroke-linecap", this.strokeLinecap)
            .attr("stroke-linejoin", this.strokeLinejoin)
            .attr("stroke-opacity", this.strokeOpacity)
            .datum(this.data)
            .attr('class', 'line')
            .attr('d', this.line)
            .call(this.transition.bind(this));

        this.tooltip = this.svg.append('g')
            .style("pointer-events", 'none');

        this.svg.call(this.zoom);
    }

    zoomed(event: any) {
        this.xz = event.transform.rescaleX(this.xScale);

        this.line.x((d: any) => {
            return this.xz(new Date(d.date))
        });

        this.path.attr('d', this.line);

        this.xAxis = (g: any, x: any) => g
            .attr('transform', `translate(0, ${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.xz)
                .ticks(this.width / 80)
                .tickSizeOuter(0));

        this.gx.call(this.xAxis);

    }

    pointermoved(event: any) {
        const i = this.xz ? d3.bisectCenter(this.x, this.xz.invert(d3.pointer(event)[0])) : d3.bisectCenter(this.x, this.xScale.invert(d3.pointer(event)[0]));
        const X = this.xz ? this.xz : this.xScale;
        this.tooltip.style('display', null);
        this.tooltip.attr('transform', `translate(${X(this.x[i])},${this.yScale(this.y[i])})`);
        this.toolPath = this.tooltip.selectAll("path")
            .data([,])
            .join("path")
            .attr("fill", "white")
            .attr("stroke", "black");

        this.toolText = this.tooltip.selectAll('text')
            .data([,])
            .join("text")
            .call((text: any) => text
                .selectAll('tspan')
                .data(`${this.title(i)}`.split(/\n/))
                .join('tspan')
                .attr("x", 0)
                .attr('y', (_: any, i: number) => `${i * 1.1}em`)
                .attr('font-weight', (_: any, i: number) => i ? null : 'bold')
                .text((d: any) => d));

        const { x, y, width: w, height: h } = this.toolText.node().getBBox();
        this.toolText.attr("transform", `translate(${-w / 2},${15 - y})`);
        this.toolPath.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    }

    pointerleft() {
        this.tooltip.style("display", "none");
        this.svg.node().value = null;
        this.svg.dispatch("input", { bubbles: true });
    }

    transition(path: any) {
        let totalLength = path.node().getTotalLength();

        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(500)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .on('end', () => {
                this.path.attr("stroke-dasharray", 'unset')
                    .attr("stroke-dashoffset", 'unset');
            });
    }
}
