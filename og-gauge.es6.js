(function() {
  Polymer({

    is: 'og-gauge',

    properties: {
      /**
      * Width of the Gauge (Number)
      *
      * @property width
      */
      width: {
        type: Number,
        value: 150
      },
      /**
      * Height of the Gauge (Number)
      *
      * @property height
      */
      height: {
        type: Number,
        value: 125
      },
      /**
      * Inner Radius of the Gauge (Number)
      *
      * @property innerRadius
      */
      innerRadius: {
        type: Number,
        value: 28
      },
      /**
      * Outer Radius of the Gauge (Number)
      *
      * @property outerRadius
      */
      outerRadius: {
        type: Number,
        value: 55
      },
      /**
      * Initial Value of the Gauge pointer (Number).
      *
      * @property value
      */
      value: {
        type: Number,
        observer: '_valueChanged',
        notify: true
      },
      /**
      * Thresholds to show value ranges in different colors
      *
      * @property thresholds
      */
      thresholds: {
        type: Array,
        notify: true,
        value: function() {
          return [];
        }
      },
      /**
      * Current value for the Solid Pointer (Number). Defaults to `value`
      *
      * @property currentValue
      */
      currentValue: {
        type: Number
      },
      /**
      * Title for Current Value
      *
      * @property currentValueTitle
      */
      currentValueTitle: {
        type: String,
        value: "Current"
      }
    },
    _valueChanged: function(newVal, oldVal) {
      if(oldVal === undefined) {
        this.draw();
      } else {
        this.updateNewGaugeValue();
      }
    },
    draw: function() {
      var d3 = Px.d3;
      // set the dimensions and margins of the graph
      var width = +this.width,
          height = +this.height;
      if(!this.currentValue) {
        this.set("currentValue", this.value);
      }
      if(!this.svg) {
        this.svg = d3.select(this.$.viz).append("svg")
            .attr("width", width)
            .attr("height", height);
      }

      var innerRadius = this.innerRadius,
          outerRadius = this.outerRadius;

      var thresholds = this.thresholds;

      var value = this.value;

      var totalParts = thresholds.reduce(function(sum, val) {
        return sum + val.parts;
      }, 0);

      if(value > totalParts) {
        value = totalParts;
      }

      this.transformer = function(d) {
        var r = 180 * d / totalParts;
        return "translate("+width/2 + "," + height/2 +") rotate(" + r + ")";
      };
      var transformer = this.transformer;

      var svg = this.svg;

      this.arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .padAngle(0);

      this.pie = d3.pie()
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2)
        .sort(null)
        .value(function(d) {
          return d.parts;
        });

      this.arcs = svg.selectAll('.arc')
        .data(this.pie(thresholds))
        .enter()
        .append('path')
        .attr("d", this.arc)
        .attr("transform", "translate("+width/2 + "," + height/2 +")")
        .style("fill", function(d, i) {
          return d.data.color;
        });

      this.needle = svg.selectAll(".needle")
        .data([value])
        .enter()
        .append('polygon')
        .attr("x", 0)
        .attr("y", 0)
        .attr("points", "0,3 "+ (-8-outerRadius) +",0 0,0")
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", "transparent")
        .style("stroke-dasharray", "1,1")
        .attr("transform", transformer);

      this.currentPos = svg.selectAll(".currentPos")
        .data([value])
        .enter()
        .append('line')
        .attr("x1", 0)
        .attr("x2", (2-outerRadius))
        .attr("y1", 0)
        .attr("y2", 0)
        .style("stroke", "black")
        .style("stroke-width", 1)
        //.style("stroke-dasharray", "5,5")
        .attr("transform", transformer);
    },
    updateNewGaugeValue: function() {
      var d3 = Px.d3;
      this.arcs.data(this.pie(this.thresholds))
        .transition()
        .attr("d", this.arc)
      this.needle.data([this.value])
        .transition()
        .ease(d3.easeElasticOut)
        .duration(2000)
        .attr("transform", this.transformer);
    }
  });

})();
