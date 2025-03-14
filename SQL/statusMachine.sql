-- Table: public.borrowed_machines

-- DROP TABLE IF EXISTS public.borrowed_machines;

CREATE TABLE IF NOT EXISTS public.borrowed_machines
(
    borrow_id integer NOT NULL DEFAULT nextval('borrowed_machines_borrow_id_seq'::regclass),
    machine_id integer NOT NULL,
    borrower_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    return_date date NOT NULL,
    comments text COLLATE pg_catalog."default",
    CONSTRAINT borrowed_machines_pkey PRIMARY KEY (borrow_id),
    CONSTRAINT borrowed_machines_machine_id_fkey FOREIGN KEY (machine_id)
        REFERENCES public.lending_machines (machine_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.borrowed_machines
    OWNER to postgres;