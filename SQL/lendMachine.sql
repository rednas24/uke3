-- Table: public.lending_machines

-- DROP TABLE IF EXISTS public.lending_machines;

CREATE TABLE IF NOT EXISTS public.lending_machines
(
    machine_id integer NOT NULL DEFAULT nextval('lending_machines_machine_id_seq'::regclass),
    serial_number character varying(255) COLLATE pg_catalog."default" NOT NULL,
    machine_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    brand character varying(255) COLLATE pg_catalog."default" NOT NULL,
    model character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT lending_machines_pkey PRIMARY KEY (machine_id),
    CONSTRAINT lending_machines_serial_number_key UNIQUE (serial_number)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.lending_machines
    OWNER to postgres;