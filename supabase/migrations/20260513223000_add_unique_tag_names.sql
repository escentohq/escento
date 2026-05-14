-- Instrument and genre names are canonical lookup values.
-- The app normalizes submitted tag text before saving, so each normalized name
-- should map to exactly one row that profiles and gigs can reference.
ALTER TABLE "instrument"
  ADD CONSTRAINT instrument_name_key UNIQUE (name);

ALTER TABLE "genre"
  ADD CONSTRAINT genre_name_key UNIQUE (name);
