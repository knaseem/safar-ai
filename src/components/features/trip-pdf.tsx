"use client"

import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import { TripData } from './trip-itinerary'

// Register fonts if needed, but Helvetica is standard
// Using standard fonts ensures reliability
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    coverPage: {
        flexDirection: 'column',
        backgroundColor: '#050505',
        color: '#ffffff',
        height: '100%',
        padding: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverTitle: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#ffffff',
    },
    coverSubtitle: {
        fontSize: 14,
        color: '#34d399',
        textTransform: 'uppercase',
        letterSpacing: 4,
        marginBottom: 40,
    },
    coverLine: {
        width: 100,
        height: 2,
        backgroundColor: '#34d399',
        marginBottom: 40,
    },
    coverFooter: {
        position: 'absolute',
        bottom: 60,
        textAlign: 'center',
        fontSize: 10,
        color: '#52525b',
        letterSpacing: 1,
    },
    // Main Content
    headerSection: {
        marginBottom: 30,
        borderBottom: '1px solid #1f2937',
        paddingBottom: 20,
    },
    badge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#34d399',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        fontSize: 9,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#ffffff',
    },
    subtitle: {
        fontSize: 11,
        color: '#71717a',
        marginBottom: 10,
    },
    // Day Section
    dayContainer: {
        marginBottom: 30,
        padding: 20,
        backgroundColor: '#111111',
        borderRadius: 12,
        border: '1px solid #1f2937',
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 15,
        borderBottom: '1px solid #1f2937',
        paddingBottom: 10,
    },
    dayTitleIdx: {
        fontSize: 20,
        color: '#34d399',
        fontWeight: 'bold',
    },
    dayTheme: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: 'medium',
    },
    // Activities
    activityRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    timeSlot: {
        width: 70,
        fontSize: 8,
        color: '#34d399',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
    activityText: {
        flex: 1,
        fontSize: 10,
        lineHeight: 1.5,
        color: '#d1d5db',
    },
    // Stay
    staySection: {
        marginTop: 15,
        padding: 10,
        backgroundColor: 'rgba(52, 211, 153, 0.05)',
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        border: '1px solid rgba(52, 211, 153, 0.1)',
    },
    stayLabel: {
        fontSize: 8,
        color: '#34d399',
        textTransform: 'uppercase',
        marginRight: 10,
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    stayText: {
        fontSize: 10,
        color: '#ffffff',
        flex: 1,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTop: '0.5px solid #1f2937',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 7,
        color: '#52525b',
    },
    brandText: {
        fontSize: 7,
        color: '#34d399',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

interface TripPdfProps {
    data: TripData
}

export const TripPdfDocument = ({ data }: TripPdfProps) => (
    <Document title={`${data.trip_name} - SafarAI Itinerary`}>
        {/* Cover Page */}
        <Page size="A4" style={styles.coverPage}>
            <View style={styles.coverLine} />
            <Text style={styles.coverSubtitle}>Autonomous Travel Experience</Text>
            <Text style={styles.coverTitle}>{data.trip_name}</Text>
            <View style={styles.coverLine} />
            <Text style={{ fontSize: 12, color: '#71717a', marginBottom: 5 }}>Prepared for the Modern Voyager</Text>
            <Text style={{ fontSize: 10, color: '#52525b' }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>

            <View style={styles.coverFooter}>
                <Text>POWERED BY SAFAR AI CONCIERGE ENGINE</Text>
            </View>
        </Page>

        {/* Itinerary Pages */}
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.headerSection}>
                <View style={styles.badge}>
                    <Text>Confirmed Itinerary</Text>
                </View>
                <Text style={styles.title}>{data.trip_name}</Text>
                <Text style={styles.subtitle}>
                    SafarAI Digital Concierge • {data.days.length} Day Bespoke Journey
                </Text>
            </View>

            {/* Content */}
            {data.days.map((day, index) => (
                <View key={day.day} style={styles.dayContainer} wrap={false}>
                    <View style={styles.dayHeader}>
                        <Text style={styles.dayTitleIdx}>DAY {day.day}</Text>
                        <Text style={styles.dayTheme}>{day.theme}</Text>
                    </View>

                    <View style={styles.activityRow}>
                        <Text style={styles.timeSlot}>Morning</Text>
                        <Text style={styles.activityText}>{day.morning}</Text>
                    </View>

                    <View style={styles.activityRow}>
                        <Text style={styles.timeSlot}>Afternoon</Text>
                        <Text style={styles.activityText}>{day.afternoon}</Text>
                    </View>

                    <View style={styles.activityRow}>
                        <Text style={styles.timeSlot}>Evening</Text>
                        <Text style={styles.activityText}>{day.evening}</Text>
                    </View>

                    <View style={styles.staySection}>
                        <Text style={styles.stayLabel}>Stay</Text>
                        <Text style={styles.stayText}>{day.stay}</Text>
                    </View>
                </View>
            ))}

            {/* Footer */}
            <View style={styles.footer} fixed>
                <Text style={styles.footerText}>© 2026 SafarAI. All rights reserved. Confidential Itinerary.</Text>
                <Text style={styles.brandText}>safar-ai.co</Text>
            </View>
        </Page>
    </Document>
)
