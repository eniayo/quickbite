#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const quickbite_stack_1 = require("../lib/quickbite-stack");
const app = new cdk.App();
new quickbite_stack_1.QuickBiteSimplifiedStack(app, 'QuickBiteStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    },
    tags: {
        Environment: 'production',
        Project: 'QuickBite',
        Owner: 'DevOps',
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tiaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmluL3F1aWNrYml0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx1Q0FBcUM7QUFDckMsbUNBQW1DO0FBQ25DLDREQUFrRTtBQUVsRSxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixJQUFJLDBDQUF3QixDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRTtJQUNsRCxHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7UUFDeEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCO0tBQ3ZDO0lBQ0QsSUFBSSxFQUFFO1FBQ0osV0FBVyxFQUFFLFlBQVk7UUFDekIsT0FBTyxFQUFFLFdBQVc7UUFDcEIsS0FBSyxFQUFFLFFBQVE7S0FDaEI7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3Rlcic7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgUXVpY2tCaXRlU2ltcGxpZmllZFN0YWNrIH0gZnJvbSAnLi4vbGliL3F1aWNrYml0ZS1zdGFjayc7XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5uZXcgUXVpY2tCaXRlU2ltcGxpZmllZFN0YWNrKGFwcCwgJ1F1aWNrQml0ZVN0YWNrJywge1xuICBlbnY6IHsgXG4gICAgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCwgXG4gICAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04gXG4gIH0sXG4gIHRhZ3M6IHtcbiAgICBFbnZpcm9ubWVudDogJ3Byb2R1Y3Rpb24nLFxuICAgIFByb2plY3Q6ICdRdWlja0JpdGUnLFxuICAgIE93bmVyOiAnRGV2T3BzJyxcbiAgfVxufSk7Il19