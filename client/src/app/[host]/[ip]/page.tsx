"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const DetailsDevice = () => {
    const params = useParams();
    const { id } = params;  // Asegúrate de que el parámetro de la ruta se llama 'id'
    const [device, setDevice] = useState<any>();

    const fetchDeviceDetails = async () => {
        try {
            const response = await fetch(`http://localhost:3000/devices/${id}`);
            const data = await response.json();
            setDevice(data);
        } catch (error) {
            console.error('Error fetching device details:', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDeviceDetails();
        }
    }, [id]);

    if (!device) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Detalles del Dispositivo</h1>
            <p><strong>Host:</strong> {device.host}</p>
            <p><strong>IP:</strong> {device.ip}</p>
            <p><strong>Nombre:</strong> {device.name}</p>
            <p><strong>Usuario:</strong> {device.user}</p>
            <p><strong>Contraseña:</strong> {device.password}</p>
        </div>
    );
};

export default DetailsDevice;
