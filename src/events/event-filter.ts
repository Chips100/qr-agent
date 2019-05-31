/**
 * Mask-like filter for events that is matched iff the event
 * has equal values for all properties defined in the filter.
 */
export interface EventFilter {
    /**
     * Single filter criteria; event must have the same values in all defined properties.
     */
    [propertyName: string]: any
}